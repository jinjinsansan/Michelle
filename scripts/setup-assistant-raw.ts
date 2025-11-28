import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { MICHELLE_PROMPT_V8, RESPONSE_FORMAT_V8 } from "../src/lib/ai/prompt";
import FormData from "form-data";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing.");
  process.exit(1);
}

const MD_DIR = path.join(process.cwd(), "md");
const VECTOR_STORE_NAME = "Tape_Psychology_Knowledge_Store";
const ASSISTANT_NAME = "Michelle AI (Tape Psychology v8.1)";

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "OpenAI-Beta": "assistants=v2",
};

async function uploadFile(filePath: string) {
  const form = new FormData();
  form.append("purpose", "assistants");
  form.append("file", fs.createReadStream(filePath));

  const res = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      ...form.getHeaders(),
    },
    body: form,
  });

  if (!res.ok) {
    throw new Error(`Failed to upload file: ${await res.text()}`);
  }
  return await res.json();
}

async function createVectorStore() {
  const res = await fetch("https://api.openai.com/v1/vector_stores", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ name: VECTOR_STORE_NAME }),
  });
  
  if (!res.ok) {
    throw new Error(`Failed to create vector store: ${await res.text()}`);
  }
  return await res.json();
}

async function addFilesToVectorStore(vectorStoreId: string, fileIds: string[]) {
  const res = await fetch(`https://api.openai.com/v1/vector_stores/${vectorStoreId}/file_batches`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ file_ids: fileIds }),
  });

  if (!res.ok) {
    throw new Error(`Failed to add files to vector store: ${await res.text()}`);
  }
  return await res.json();
}

async function createAssistant(vectorStoreId: string) {
  const instructions = `${MICHELLE_PROMPT_V8}\n\n${RESPONSE_FORMAT_V8}`;
  
  const payload = {
    name: ASSISTANT_NAME,
    instructions: instructions,
    model: "gpt-4o",
    tools: [{ type: "file_search" }],
    tool_resources: {
      file_search: {
        vector_store_ids: [vectorStoreId],
      },
    },
  };

  const res = await fetch("https://api.openai.com/v1/assistants", {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to create assistant: ${await res.text()}`);
  }
  return await res.json();
}

async function main() {
  console.log("🚀 Starting OpenAI Assistant Setup (Raw API)...");

  // 1. Upload Files
  const files = fs.readdirSync(MD_DIR).filter((file) => file.endsWith(".md"));
  console.log(`Found ${files.length} markdown files.`);

  const fileIds = [];
  for (const file of files) {
    process.stdout.write(`Uploading ${file}... `);
    const uploaded = await uploadFile(path.join(MD_DIR, file));
    console.log(`✅ ID: ${uploaded.id}`);
    fileIds.push(uploaded.id);
  }

  // 2. Create Vector Store
  console.log("📦 Creating Vector Store...");
  const vectorStore = await createVectorStore();
  console.log(`✅ Vector Store ID: ${vectorStore.id}`);

  // 3. Add Files to Vector Store
  console.log("🔗 Linking files to Vector Store...");
  await addFilesToVectorStore(vectorStore.id, fileIds);
  console.log("✅ Files linked.");

  // 4. Create Assistant
  console.log("🤖 Creating Assistant...");
  const assistant = await createAssistant(vectorStore.id);

  console.log("\n🎉 Assistant Created Successfully!");
  console.log("--------------------------------------------------");
  console.log(`ASSISTANT_ID=${assistant.id}`);
  console.log("--------------------------------------------------");
  console.log("\n⚠️  Please add this ASSISTANT_ID to your .env.local file.");
}

main().catch((err) => {
  console.error("\n❌ Error:", err);
  process.exit(1);
});
