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
    const lastUserText = latestUserEntry?.content ?? message;
    const knowledgeMatches = lastUserText
      ? await retrieveKnowledgeMatches(supabase, lastUserText)
      : [];
    const knowledgeContext = formatKnowledgeMatches(knowledgeMatches);

    const baseConversation: ChatCompletionMessageParam[] = summarizedHistory.map((entry) => ({
      role: entry.role === "assistant" ? "assistant" : "user",
      content: entry.content,
    }));
    const conversation = applyKnowledgeContext(baseConversation, knowledgeContext);
    const stateInstruction = buildStateInstruction(lastUserText);
    const knowledgeSummary = knowledgeMatches.map((match) => ({
      id: match.id,
      similarity: Number(match.similarity.toFixed(2)),
      preview: summarizeContent(match.content),
      source: resolveKnowledgeSource(match.metadata),
    }));

    const systemMessages: ChatCompletionMessageParam[] = [{ role: "system", content: TAPE_SYSTEM_PROMPT }];
    if (stateInstruction) {
      systemMessages.push({ role: "system", content: stateInstruction });
    }
    const finalMessages: ChatCompletionMessageParam[] = [...systemMessages, ...conversation];

    const openai = getOpenAIClient();
    const chatModel = process.env.OPENAI_CHAT_MODEL ?? "gpt-4o-mini";

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          controller.enqueue(
            encoder.encode(`data:${JSON.stringify({ type: "meta", sessionId: activeSessionId })}\n\n`),
          );

          const completion = await openai.chat.completions.create({
            model: chatModel,
            temperature: 0.4,
            max_tokens: 800,
            stream: true,
            messages: finalMessages,
          });

          let fullReply = "";
          for await (const chunk of completion) {
            const delta = chunk.choices[0]?.delta?.content ?? "";
            if (delta) {
              fullReply += delta;
              controller.enqueue(
                encoder.encode(`data:${JSON.stringify({ type: "delta", content: delta })}\n\n`),
              );
            }
          }

          const trimmedReply = fullReply.trim();
          if (!trimmedReply) {
            controller.enqueue(
              encoder.encode(`data:${JSON.stringify({ type: "error", message: "応答を生成できませんでした。" })}\n\n`),
            );
            controller.close();
            return;
          }

          const assistantMessagePayload: MessageInsert = {
            session_id: activeSessionId,
            role: "assistant",
            content: trimmedReply,
          };
          const insertResult = await supabase
            .from("messages")
            .insert(assistantMessagePayload as never);

          if (insertResult.error) {
            console.error(insertResult.error);
          }

          controller.enqueue(
            encoder.encode(
              `data:${JSON.stringify({ type: "meta", sessionId: activeSessionId, knowledge: knowledgeSummary })}\n\n`,
            ),
          );
          controller.enqueue(encoder.encode(`data:${JSON.stringify({ type: "done" })}\n\n`));
          controller.close();
        } catch (error) {
          console.error(error);
          controller.enqueue(
            encoder.encode(
              `data:${JSON.stringify({ type: "error", message: "応答の生成に失敗しました。" })}\n\n`,
            ),
          );
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
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
      return `### 参考情報${idx + 1} (類似度: ${similarity}%)\n${match.content.trim()}`;
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
      content: `以下は内部専用の参考情報です。内容を自然な日本語で要約し、最低1点は応答に織り込みながらも引用タグや出典名は出さないでください。クライアントの語りを最優先にしつつ活用してください。\n${knowledgeContext}`,
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

function resolveKnowledgeSource(metadata: KnowledgeMatch["metadata"]) {
  if (metadata && typeof metadata === "object" && !Array.isArray(metadata)) {
    const source = (metadata as Record<string, unknown>).source;
    if (typeof source === "string") {
      return source;
    }
  }
  return undefined;
}

const THOUGHT_CHAN_KEYWORDS = ["助けて", "無理", "分からない", "怖い", "どうしよう", "苦しい", "情けない", "終わった", "できない"];
const MIND_AREA_KEYWORDS = ["考えて", "気づいた", "もしかして", "整理", "向き合う", "俯瞰", "落ち着いて"];
const NOT_READY_KEYWORDS = ["でも", "だって", "無理", "できない", "変わらない", "嫌だ", "面倒", "疲れた"];
const READY_KEYWORDS = ["向き合いたい", "知りたい", "変わりたい", "気づきたい", "教えて", "整理したい", "聴いてほしい"];

const EMOTION_PATTERNS = [
  {
    label: "無価値観",
    keywords: ["価値", "情けない", "役に立たない", "ダメ", "無能", "意味がない", "成長していない"],
    hint: "努力が報われない痛みを映し、価値と成果を分けて扱えるよう促す",
  },
  {
    label: "寂しさ",
    keywords: ["孤独", "一人", "愛され", "見捨て", "誰も", "寂しい", "つながりがない"],
    hint: "誰かに届いてほしい気持ちを受け止め、必要としていた安心を言語化する",
  },
  {
    label: "恐怖",
    keywords: ["怖", "不安", "心配", "震える", "プレッシャー", "未来", "失敗"],
    hint: "何が怖いのか丁寧に聞き、今ここに戻る支えをつくる",
  },
  {
    label: "怒り",
    keywords: ["怒", "許せない", "腹立つ", "苛立ち", "ムカつく"],
    hint: "表面の怒りの下にある本当の痛みを一緒に探る",
  },
  {
    label: "罪悪感",
    keywords: ["悪い", "罪悪感", "迷惑", "自分のせい", "申し訳", "償い"],
    hint: "責め続けている自分に気づかせ、赦しの余地を尋ねる",
  },
];

function buildStateInstruction(text?: string) {
  const normalized = text?.trim();
  if (!normalized) {
    return "";
  }

  const area = detectArea(normalized);
  const readiness = detectReadiness(normalized);
  const emotionInsights = detectEmotionSignals(normalized);

  const lines: string[] = [
    "### セッション状態ガイド",
    `- 想定エリア: ${area}`,
    `- 向き合い準備度: ${readiness}`,
  ];

  if (emotionInsights.length) {
    lines.push("- 反応していそうな感情:");
    emotionInsights.forEach((insight) => lines.push(`  - ${insight}`));
  } else {
    lines.push("- 反応していそうな感情: クライアントの言葉から静かに探ってください。");
  }

  lines.push(
    "- このターンでは『受容→状態共有→感情の深掘り→気づきの問い→主体性の確認』の順を守り、気づきが生まれる余白を残してください。",
  );

  return lines.join("\n");
}

function detectArea(text: string) {
  const thoughtScore = keywordScore(text, THOUGHT_CHAN_KEYWORDS);
  const mindScore = keywordScore(text, MIND_AREA_KEYWORDS);
  if (thoughtScore > mindScore) {
    return "思考ちゃんエリア（揺れが大きい状態）";
  }
  if (mindScore > thoughtScore) {
    return "マインドエリア（俯瞰し始めている状態）";
  }
  return "観察中（まずは安全と受容を優先）";
}

function detectReadiness(text: string) {
  const notReadyScore = keywordScore(text, NOT_READY_KEYWORDS);
  const readyScore = keywordScore(text, READY_KEYWORDS);
  if (readyScore > notReadyScore + 1) {
    return "向き合う準備が整いつつある";
  }
  if (notReadyScore > readyScore + 1) {
    return "まだ準備が整っていない（待つ姿勢が必要）";
  }
  return "揺れているため、一緒に呼吸を合わせて整える";
}

function detectEmotionSignals(text: string) {
  const insights: string[] = [];
  for (const pattern of EMOTION_PATTERNS) {
    if (keywordScore(text, pattern.keywords) > 0) {
      insights.push(`${pattern.label}：${pattern.hint}`);
    }
  }
  return insights.slice(0, 3);
}

function keywordScore(text: string, keywords: string[]) {
  const haystack = text.toLowerCase();
  return keywords.reduce((score, keyword) => {
    if (!keyword) {
      return score;
    }
    if (haystack.includes(keyword.toLowerCase())) {
      return score + Math.max(1, Math.min(3, Math.ceil(keyword.length / 3)));
    }
    return score;
  }, 0);
}
