import { NextResponse } from "next/server";
import type { MessageParam, TextBlock } from "@anthropic-ai/sdk/resources/messages";
import { z } from "zod";

import { getAnthropicClient } from "@/lib/ai/anthropic";
import { retrieveKnowledgeMatches, type KnowledgeMatch } from "@/lib/ai/rag";
import { TAPE_SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

const requestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
  category: z.enum(["love", "life", "relationship"]).optional(),
});

const MAX_CONTEXT_MESSAGES = 30;
const DEFAULT_CATEGORY: Database["public"]["Enums"]["session_category"] = "life";
type SessionsTable = Database["public"]["Tables"]["sessions"];
type SessionInsert = SessionsTable["Insert"];
type SessionRow = SessionsTable["Row"];
type MessagesTable = Database["public"]["Tables"]["messages"];
type MessageInsert = MessagesTable["Insert"];

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { sessionId, message, category } = requestSchema.parse(payload);

    const supabase = createSupabaseServerClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let activeSessionId = sessionId ?? null;

    if (activeSessionId) {
      const { data: existingSession, error: sessionLookupError } = await supabase
        .from("sessions")
        .select("id")
        .eq("id", activeSessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (sessionLookupError || !existingSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    } else {
      const derivedCategory = (category ?? DEFAULT_CATEGORY) as SessionInsert["category"];
      const title = message.trim().slice(0, 60) || "新しい相談";
      const newSessionPayload: SessionInsert = {
        user_id: user.id,
        category: derivedCategory,
        title,
      };
      const { data: newSession, error: createSessionError } = await supabase
        .from("sessions")
        .insert(newSessionPayload as never)
        .select("id")
        .single();

      const createdSession = newSession as Pick<SessionRow, "id"> | null;

      if (createSessionError || !createdSession) {
        console.error(createSessionError);
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
      }

      activeSessionId = createdSession.id;
    }

    const userMessagePayload: MessageInsert = {
      session_id: activeSessionId,
      role: "user",
      content: message,
    };
    const userMessageInsert = await supabase
      .from("messages")
      .insert(userMessagePayload as never);

    if (userMessageInsert.error) {
      console.error(userMessageInsert.error);
      return NextResponse.json({ error: "Failed to save message" }, { status: 500 });
    }

    const { data: history, error: historyError } = await supabase
      .from("messages")
      .select("role, content")
      .eq("session_id", activeSessionId)
      .order("created_at", { ascending: true })
      .limit(MAX_CONTEXT_MESSAGES);

    if (historyError) {
      console.error(historyError);
      return NextResponse.json({ error: "Failed to load conversation" }, { status: 500 });
    }

    const summarizedHistory = (history as Pick<MessagesTable["Row"], "role" | "content">[] | null) ?? [];
    const latestUserEntry = [...summarizedHistory].reverse().find((entry) => entry.role === "user");
    const knowledgeMatches = latestUserEntry
      ? await retrieveKnowledgeMatches(supabase, latestUserEntry.content)
      : [];
    const knowledgeContext = formatKnowledgeMatches(knowledgeMatches);

    const anthropic = getAnthropicClient();
    const baseConversation: MessageParam[] = summarizedHistory.map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: [{ type: "text", text: entry.content }],
    }));
    const conversation = applyKnowledgeContext(baseConversation, knowledgeContext);

    const completion = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 600,
      temperature: 0.4,
      system: TAPE_SYSTEM_PROMPT,
      messages: conversation,
    });

    const assistantReply = completion.content
      .filter((block): block is TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("\n")
      .trim();

    if (!assistantReply) {
      return NextResponse.json({ error: "No response generated" }, { status: 502 });
    }

    const assistantMessagePayload: MessageInsert = {
      session_id: activeSessionId,
      role: "assistant",
      content: assistantReply,
    };
    const assistantMessageInsert = await supabase
      .from("messages")
      .insert(assistantMessagePayload as never);

    if (assistantMessageInsert.error) {
      console.error(assistantMessageInsert.error);
      return NextResponse.json({ error: "Failed to save assistant reply" }, { status: 500 });
    }

    return NextResponse.json({
      sessionId: activeSessionId,
      reply: assistantReply,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.flatten() }, { status: 400 });
    }

    console.error(error);
    return NextResponse.json({ error: "Unexpected error" }, { status: 500 });
  }
}

function formatKnowledgeMatches(matches: KnowledgeMatch[]) {
  if (!matches.length) {
    return "";
  }

  return matches
    .map((match, idx) => {
      const similarity = Math.round(match.similarity * 100);
      return `### ナレッジ${idx + 1} (類似度: ${similarity}%)\n${match.content.trim()}`;
    })
    .join("\n\n");
}

function applyKnowledgeContext(messages: MessageParam[], knowledgeContext: string) {
  if (!knowledgeContext) {
    return messages;
  }

  const cloned = messages.map((message) => ({
    ...message,
    content: Array.isArray(message.content) ? [...message.content] : message.content,
  }));

  for (let i = cloned.length - 1; i >= 0; i -= 1) {
    const message = cloned[i];
    if (message.role !== "user") {
      continue;
    }

    const textBlocks = Array.isArray(message.content)
      ? message.content.filter((block): block is TextBlock => block.type === "text")
      : [];
    const fallbackText = typeof message.content === "string" ? message.content : "";
    const text = (textBlocks.length ? textBlocks.map((block) => block.text).join("\n") : fallbackText).trim();

    const augmented = `以下はTapeAI内部の参考情報です。必要に応じて活用しながらも、ユーザーの語りを最優先してください。\n${knowledgeContext}\n\n---\nユーザーの相談:\n${text}`;

    cloned[i] = {
      role: "user",
      content: [{ type: "text", text: augmented }],
    };

    break;
  }

  return cloned;
}
