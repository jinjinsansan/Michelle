import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config({ path: ".env.local" });

const API_KEY = process.env.OPENAI_API_KEY;

const headers = {
  "Authorization": `Bearer ${API_KEY}`,
};

async function listModels() {
  const res = await fetch("https://api.openai.com/v1/models", { headers });
  const data = await res.json() as { data: { id: string }[] };
  
  const gptModels = data.data
    .map(m => m.id)
    .filter(id => id.includes("gpt"))
    .sort();
    
  console.log("Available GPT Models:");
  gptModels.forEach(id => console.log(`- ${id}`));
}

listModels();
