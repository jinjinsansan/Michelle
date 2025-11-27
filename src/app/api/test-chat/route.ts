// テスト用チャットAPI（認証なし）
// 開発中のテスト専用 - 本番では削除すること

import { NextResponse } from "next/server";
import { z } from "zod";
import { TAPE_SYSTEM_PROMPT, RESPONSE_FORMAT_INSTRUCTION } from "@/lib/ai/prompt";
import { getOpenAIClient } from "@/lib/ai/openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(["user", "assistant", "system"]),
    content: z.string(),
  })).optional(),
  message: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { messages = [], message } = requestSchema.parse(payload);

    const openai = getOpenAIClient();

    // メッセージ履歴を構築
    const chatMessages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: TAPE_SYSTEM_PROMPT + "\n\n" + RESPONSE_FORMAT_INSTRUCTION,
      },
      ...messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      {
        role: "user",
        content: message,
      },
    ];

    // OpenAI APIを呼び出し
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 1000,
    });

    const assistantMessage = completion.choices[0]?.message?.content || "";

    return NextResponse.json({
      success: true,
      message: assistantMessage,
      role: "assistant",
    });
  } catch (error) {
    console.error("Test chat error:", error);
    return NextResponse.json(
      { error: "Failed to process message", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
