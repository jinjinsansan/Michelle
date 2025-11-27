import type { SupabaseClient } from "@supabase/supabase-js";

import { getOpenAIClient } from "./openai";
import type { Database, Json } from "@/types/database";

const EMBEDDING_MODEL = "text-embedding-3-small";
const DEFAULT_THRESHOLD = 0.65;
const FALLBACK_THRESHOLDS = [0.58, 0.5, 0.45, 0.35];

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
      match_count: options.matchCount ?? 8,
      similarity_threshold: threshold,
    };

    const { data, error } = await supabase.rpc("match_knowledge", rpcArgs as never);
    if (error) {
      console.error("match_knowledge error", error);
      return [] as KnowledgeMatch[];
    }
    return (data ?? []) as KnowledgeMatch[];
  };

  const thresholds = [options.similarityThreshold ?? DEFAULT_THRESHOLD, ...FALLBACK_THRESHOLDS]
    .filter((value, index, arr) => value > 0 && arr.indexOf(value) === index)
    .sort((a, b) => b - a);

  for (const threshold of thresholds) {
    const matches = await attempt(threshold);
    if (matches.length) {
      return matches;
    }
  }

  return [];
}
