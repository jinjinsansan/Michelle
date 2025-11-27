import Anthropic from "@anthropic-ai/sdk";

let anthropicSingleton: Anthropic | null = null;

export function getAnthropicClient() {
  if (anthropicSingleton) {
    return anthropicSingleton;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("ANTHROPIC_API_KEY is not set.");
  }

  anthropicSingleton = new Anthropic({ apiKey });
  return anthropicSingleton;
}
