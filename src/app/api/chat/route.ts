import { NextResponse } from "next/server";
import { z } from "zod";

import { retrieveKnowledgeMatches, type KnowledgeMatch } from "@/lib/ai/rag";
import { TAPE_SYSTEM_PROMPT } from "@/lib/ai/prompt";
import { getSupabaseUserContext } from "@/lib/supabase/context";
import { getOpenAIClient } from "@/lib/ai/openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
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

    const { client: supabase, userId } = await getSupabaseUserContext();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let activeSessionId = sessionId ?? null;

    if (activeSessionId) {
      const { data: existingSession, error: sessionLookupError } = await supabase
        .from("sessions")
        .select("id")
        .eq("id", activeSessionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (sessionLookupError || !existingSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }
    } else {
      const derivedCategory = (category ?? DEFAULT_CATEGORY) as SessionInsert["category"];
      const title = message.trim().slice(0, 60) || "新しい相談";
      const newSessionPayload: SessionInsert = {
        user_id: userId,
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

    const baseConversation: ChatCompletionMessageParam[] = summarizedHistory.map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: entry.content,
    }));
    const conversation = applyKnowledgeContext(baseConversation, knowledgeContext);

    const openai = getOpenAIClient();
    const chatModel = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";
    const completion = await openai.chat.completions.create({
      model: chatModel,
      temperature: 0.4,
      max_tokens: 800,
      messages: [{ role: "system", content: TAPE_SYSTEM_PROMPT }, ...conversation],
    });

    const assistantReply = completion.choices[0]?.message?.content?.trim() ?? "";

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

    const knowledgeSummary = knowledgeMatches.map((match) => ({
      id: match.id,
      similarity: Number(match.similarity.toFixed(2)),
      preview: summarizeContent(match.content),
    }));

    return NextResponse.json({
      sessionId: activeSessionId,
      reply: assistantReply,
      knowledge: knowledgeSummary,
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

function applyKnowledgeContext(
  messages: ChatCompletionMessageParam[],
  knowledgeContext: string,
): ChatCompletionMessageParam[] {
  if (!knowledgeContext) {
    return messages;
  }

  const cloned = [...messages];

  for (let i = cloned.length - 1; i >= 0; i -= 1) {
    const message = cloned[i];
    if (message.role !== "user" || typeof message.content !== "string") {
      continue;
    }

    cloned.splice(i, 0, {
      role: "system",
      content: `以下はTapeAI内部の参考情報です。必要に応じて活用しながらも、クライアントの語りを最優先してください。\n${knowledgeContext}`,
    });
    break;
  }

  return cloned;
}

function summarizeContent(content: string, maxLength = 140) {
  const trimmed = content.replace(/\s+/g, " ").trim();
  if (trimmed.length <= maxLength) {
    return trimmed;
  }
  return `${trimmed.slice(0, maxLength)}...`;
}
