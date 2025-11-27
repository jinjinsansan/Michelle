import type { SupabaseClient } from "@supabase/supabase-js";

import { getOpenAIClient } from "./openai";
import type { Database, Json } from "@/types/database";

const EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_THRESHOLD = 0.65;

export type KnowledgeMatch = {
  id: string;
  content: string;
  metadata: Json | null;
  similarity: number;
};

export async function embedText(text: string) {
  const normalized = text.trim();
  if (!normalized) {
    return [] as number[];
  }

  const openai = getOpenAIClient();
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: normalized,
  });

  return response.data[0]?.embedding ?? [];
}

type RetrieveOptions = {
  matchCount?: number;
  similarityThreshold?: number;
};

export async function retrieveKnowledgeMatches(
  supabase: SupabaseClient<Database>,
  text: string,
  options: RetrieveOptions = {},
): Promise<KnowledgeMatch[]> {
  const embedding = await embedText(text);
  if (!embedding.length) {
    return [] as KnowledgeMatch[];
  }

  const attempt = async (threshold: number) => {
    const rpcArgs: Database["public"]["Functions"]["match_knowledge"]["Args"] = {
      query_embedding: embedding,
      match_count: options.matchCount ?? 6,
      similarity_threshold: threshold,
    };

    const { data, error } = await supabase.rpc("match_knowledge", rpcArgs as never);
    if (error) {
      console.error("match_knowledge error", error);
      return [] as KnowledgeMatch[];
    }
    return (data ?? []) as KnowledgeMatch[];
  };

  const primaryThreshold = options.similarityThreshold ?? DEFAULT_THRESHOLD;
  let matches = await attempt(primaryThreshold);

  if ((!matches || matches.length === 0) && primaryThreshold > 0.45) {
    matches = await attempt(0.45);
  }
  return matches;
}
