import dotenv from "dotenv";
import { MICHELLE_PROMPT_V8, RESPONSE_FORMAT_V8 } from "../src/lib/ai/prompt";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.OPENAI_API_KEY;
// 前回のIDを指定
const ASSISTANT_ID = "asst_l2JEignTzzXF2a9PL6jgIsV9";

if (!API_KEY) {
  console.error("❌ OPENAI_API_KEY is missing.");
  process.exit(1);
}

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
  "Content-Type": "application/json",
  "OpenAI-Beta": "assistants=v2",
};

async function updateAssistant() {
  console.log(`🔄 Updating Assistant: ${ASSISTANT_ID}...`);
  
  const instructions = `${MICHELLE_PROMPT_V8}\n\n${RESPONSE_FORMAT_V8}`;
  
  const payload = {
    instructions: instructions,
    name: "Michelle AI (v8.2 - No Jargon)", // 名前も更新してわかりやすく
  };

  const res = await fetch(`https://api.openai.com/v1/assistants/${ASSISTANT_ID}`, {
    method: "POST", // Update is POST in OpenAI API
    headers: headers,
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Failed to update assistant: ${await res.text()}`);
  }
  return await res.json();
}

async function main() {
  try {
    const updated = await updateAssistant();
    console.log("✅ Assistant Updated Successfully!");
    console.log(`Name: ${updated.name}`);
    console.log(`Instructions length: ${updated.instructions.length} chars`);
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main();
