import "dotenv/config";

import fs from "node:fs/promises";
import path from "node:path";

import OpenAI from "openai";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { chunkText } from "./chunk";

const KNOWLEDGE_DIR = path.resolve(process.cwd(), "md");
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const BATCH_SIZE = 10;
const EMBEDDING_MODEL = "text-embedding-3-small";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required to generate embeddings.");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const supabase = createSupabaseAdminClient();

async function listMarkdownFiles(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        return listMarkdownFiles(fullPath);
      }
      if (entry.isFile() && entry.name.endsWith(".md")) {
        return [fullPath];
      }
      return [];
    }),
  );
  return files.flat();
}

async function embedText(input: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input,
  });
  return response.data[0].embedding;
}

async function processFile(filePath: string) {
  const relativeSource = path.relative(KNOWLEDGE_DIR, filePath) || path.basename(filePath);
  console.log(`\n📄 Processing ${relativeSource}`);

  const content = await fs.readFile(filePath, "utf-8");
  const chunks = chunkText(content, { chunkSize: CHUNK_SIZE, overlap: CHUNK_OVERLAP });

  if (chunks.length === 0) {
    console.log("  ⚠️  No content found, skipping.");
    return;
  }

  const { error: deleteError } = await supabase
    .from("knowledge")
    .delete()
    .eq("metadata->>source", relativeSource);
  if (deleteError) {
    throw deleteError;
  }

  for (let i = 0; i < chunks.length; i += BATCH_SIZE) {
    const slice = chunks.slice(i, i + BATCH_SIZE);
    const embeddings = [] as number[][];
    for (const chunk of slice) {
      const embedding = await embedText(chunk.content);
      embeddings.push(embedding);
    }

    const rows = slice.map((chunk, idx) => ({
      content: chunk.content,
      embedding: embeddings[idx],
      metadata: {
        source: relativeSource,
        chunk_index: chunk.index,
      },
    }));

    const { error } = await supabase.from("knowledge").insert(rows);
    if (error) {
      throw error;
    }

    console.log(
      `  ✅ Inserted chunks ${slice[0].index}-${slice[slice.length - 1].index} (${Math.min(
        i + BATCH_SIZE,
        chunks.length,
      )}/${chunks.length})`,
    );
  }
}

async function main() {
  try {
    await fs.access(KNOWLEDGE_DIR);
  } catch {
    throw new Error(`Knowledge directory not found: ${KNOWLEDGE_DIR}`);
  }

  const files = await listMarkdownFiles(KNOWLEDGE_DIR);
  if (files.length === 0) {
    console.log("No markdown files found in md directory.");
    return;
  }

  for (const file of files) {
    await processFile(file);
  }

  console.log("\n✨ Knowledge base upload complete.");
}

main().catch((error) => {
  console.error("\n❌ Failed to seed knowledge base");
  console.error(error);
  process.exit(1);
});
