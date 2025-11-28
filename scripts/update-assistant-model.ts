import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.OPENAI_API_KEY;
const ASSISTANT_ID = process.env.ASSISTANT_ID || "asst_h5rrljLWogiiDUrgzz0hH17C";

if (!API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing.");
  process.exit(1);
}

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "OpenAI-Beta": "assistants=v2",
};

async function updateModel() {
  console.log(`🔄 Updating Assistant Model to GPT-4.1...`);
  console.log(`Assistant ID: ${ASSISTANT_ID}`);
  
  const payload = {
    model: "gpt-4.1", // GPT-4.1を指定
  };

  const res = await fetch(`https://api.openai.com/v1/assistants/${ASSISTANT_ID}`, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(`Failed to update assistant: ${JSON.stringify(error, null, 2)}`);
  }
  return await res.json();
}

async function main() {
  try {
    const updated = await updateModel();
    console.log("✅ Assistant Model Updated Successfully!");
    console.log(`New Model: ${updated.model}`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
