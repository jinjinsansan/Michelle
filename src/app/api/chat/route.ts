import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseUserContext } from "@/lib/supabase/context";
import { getOpenAIClient } from "@/lib/ai/openai";
import { retrieveKnowledgeMatches } from "@/lib/ai/rag";
import type { Database } from "@/types/database";

// 環境変数からAssistant IDを取得
const ASSISTANT_ID = process.env.ASSISTANT_ID || "asst_h5rrljLWogiiDUrgzz0hH17C"; // フォールバック（v8.4 - New Knowledge Added）

const requestSchema = z.object({
  sessionId: z.string().uuid().optional(),
  message: z.string().min(1).max(2000),
  category: z.enum(["love", "life", "relationship"]).optional(),
});

type SessionsTable = Database["public"]["Tables"]["sessions"];
type SessionInsert = SessionsTable["Insert"];

// DB型定義にないカラムを扱うための拡張型
type SessionWithThread = {
  id: string;
  openai_thread_id?: string | null;
};

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const { sessionId, message, category } = requestSchema.parse(payload);

    const { client: supabase, userId } = await getSupabaseUserContext();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const openai = getOpenAIClient();
    let activeSessionId = sessionId ?? null;
    let threadId: string | null = null;

    // 1. セッションとスレッドの取得・作成
    if (activeSessionId) {
      // 既存セッションの取得
      const { data: existingSession, error: sessionLookupError } = await supabase
        .from("sessions")
        .select("id, openai_thread_id" as any) // 型定義にないカラムを選択
        .eq("id", activeSessionId)
        .eq("user_id", userId)
        .maybeSingle();

      if (sessionLookupError || !existingSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      const sessionData = existingSession as unknown as SessionWithThread;
      threadId = sessionData.openai_thread_id ?? null;
    } else {
      // 新規セッションの作成
      const derivedCategory = (category ?? "life") as SessionInsert["category"];
      const title = message.trim().slice(0, 60) || "新しい相談";
      
      const { data: newSession, error: createSessionError } = await supabase
        .from("sessions")
        .insert({
          user_id: userId,
          category: derivedCategory,
          title,
        } as any)
        .select("id")
        .single();

      if (createSessionError || !newSession) {
        console.error(createSessionError);
        return NextResponse.json({ error: "Failed to create session" }, { status: 500 });
      }
      
      // 明示的に型キャストしてエラーを回避
      const session = newSession as { id: string };
      activeSessionId = session.id;
    }

    // 2. OpenAI Threadの準備
    if (!threadId) {
      console.log("🧵 Creating new OpenAI Thread...");
      const thread = await openai.beta.threads.create();
      threadId = thread.id;

      // DBに保存（型定義にないカラムのためanyキャストを重ねる）
      await (supabase.from("sessions") as any)
        .update({ openai_thread_id: threadId })
        .eq("id", activeSessionId);
    }

    // 3. メッセージの保存（DB）
    // Assistants APIを使う場合でも、表示用にDBに保存しておくのが無難
    const userMessageInsert = await supabase
      .from("messages")
      .insert({
        session_id: activeSessionId,
        role: "user",
        content: message,
      } as any);

    if (userMessageInsert.error) {
      console.error("Failed to save user message:", userMessageInsert.error);
    }

    // 4. RAG検索：関連知識を取得
    const knowledgeMatches = await retrieveKnowledgeMatches(supabase, message, {
      matchCount: 8,              // 5件→8件に増加（より多くの知識を活用）
      similarityThreshold: 0.45,  // 0.5→0.45に緩和（より広範囲にヒット）
    });

    // 5. Threadにメッセージを追加（RAG知識を含める）
    let enhancedMessage = message;
    
    if (knowledgeMatches.length > 0) {
      const knowledgeContext = knowledgeMatches
        .map((match, idx) => `[参考知識${idx + 1}]\n${match.content}`)
        .join("\n\n");
      
      enhancedMessage = `【ユーザーメッセージ】\n${message}\n\n【参考：テープ式心理学ナレッジ】\n以下の知識を参考にして、気づきを促すフェーズで適切に活用してください。\n\n${knowledgeContext}`;
    }

    await openai.beta.threads.messages.create(threadId, {
      role: "user",
      content: enhancedMessage,
    });

    // 5. Runの実行とストリーミング
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // 開始メタデータ
          controller.enqueue(
            encoder.encode(`data:${JSON.stringify({ type: "meta", sessionId: activeSessionId })}\n\n`)
          );

          let fullReply = "";

          // OpenAIストリーミング実行
          const runStream = openai.beta.threads.runs.stream(threadId!, {
            assistant_id: ASSISTANT_ID,
          })
            .on("textDelta", (delta, snapshot) => {
              const content = delta.value;
              if (content) {
                fullReply += content;
                controller.enqueue(
                  encoder.encode(`data:${JSON.stringify({ type: "delta", content: content })}\n\n`)
                );
              }
            })
            .on("end", async () => {
              // 完了時の処理
              if (!fullReply) return;

              // アシスタントの回答をDBに保存
              await supabase
                .from("messages")
                .insert({
                  session_id: activeSessionId,
                  role: "assistant",
                  content: fullReply,
                } as any);

              controller.enqueue(encoder.encode(`data:${JSON.stringify({ type: "done" })}\n\n`));
              controller.close();
            })
            .on("error", (error) => {
              console.error("Stream error:", error);
              controller.enqueue(
                encoder.encode(`data:${JSON.stringify({ type: "error", message: "AI応答中にエラーが発生しました。" })}\n\n`)
              );
              controller.close();
            });

          // ストリームの完了を待つためのPromiseラッパーなどは不要（イベントリスナーで完結）
          
        } catch (error) {
          console.error("Controller error:", error);
          controller.enqueue(
            encoder.encode(`data:${JSON.stringify({ type: "error", message: "処理中にエラーが発生しました。" })}\n\n`)
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
    console.error("API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
