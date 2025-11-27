"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type SessionSummary = {
  id: string;
  title: string | null;
  category: string;
  updated_at: string;
};

type MessageItem = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  created_at: string;
  pending?: boolean;
};

type SessionsResponse = {
  sessions: SessionSummary[];
};

type MessagesResponse = {
  session: Pick<SessionSummary, "id" | "title" | "category">;
  messages: MessageItem[];
};

type StreamPayload = {
  type: "delta" | "meta" | "done" | "error";
  content?: string;
  message?: string;
  sessionId?: string;
  knowledge?: KnowledgeReference[];
};

type KnowledgeReference = {
  id: string;
  similarity: number;
  preview: string;
  source?: string;
};

export default function ChatClient() {
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);
  const [knowledgeRefs, setKnowledgeRefs] = useState<KnowledgeReference[]>([]);
  const [syncLocked, setSyncLocked] = useState(false);

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  const handleUnauthorized = useCallback(() => {
    setNeedsAuth(true);
    setStatus("この機能を利用するにはログインが必要です");
  }, []);

  const loadSessions = useCallback(
    async (options?: { skipAutoSelect?: boolean }) => {
      setSessionsLoading(true);
      try {
        const response = await fetch("/api/sessions", { credentials: "include" });
        if (response.status === 401) {
          handleUnauthorized();
          setSessions([]);
          return;
        }
        if (!response.ok) {
          throw new Error("セッション一覧の取得に失敗しました");
        }
        const data = (await response.json()) as SessionsResponse;
        setSessions(data.sessions ?? []);
        if (!options?.skipAutoSelect && !activeSessionId && data.sessions.length) {
          setActiveSessionId(data.sessions[0].id);
        }
      } catch (error) {
        console.error(error);
        setStatus((error as Error).message);
      } finally {
        setSessionsLoading(false);
      }
    },
    [activeSessionId, handleUnauthorized],
  );

  const loadMessages = useCallback(
    async (sessionId: string) => {
      setMessagesLoading(true);
      try {
        const response = await fetch(`/api/sessions/${sessionId}/messages`, {
          credentials: "include",
        });
        if (response.status === 401) {
          handleUnauthorized();
          return;
        }
        if (!response.ok) {
          throw new Error("メッセージ履歴の取得に失敗しました");
        }
        const data = (await response.json()) as MessagesResponse;
        setMessages(data.messages ?? []);
      } catch (error) {
        console.error(error);
        setStatus((error as Error).message);
      } finally {
        setMessagesLoading(false);
      }
    },
    [handleUnauthorized],
  );

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!activeSessionId || syncLocked) {
      return;
    }
    loadMessages(activeSessionId);
  }, [activeSessionId, loadMessages, syncLocked]);

  const handleNewConversation = () => {
    setActiveSessionId(null);
    setMessages([]);
    setKnowledgeRefs([]);
    setStatus(null);
    setSyncLocked(false);
  };

  const appendMessage = (message: MessageItem) => {
    setMessages((prev) => [...prev, message]);
  };

  const updateMessage = (id: string, updater: (prev: MessageItem) => MessageItem) => {
    setMessages((prev) => prev.map((message) => (message.id === id ? updater(message) : message)));
  };

  const handleSend = async () => {
    if (!input.trim() || sending || needsAuth) {
      return;
    }

    const text = input.trim();
    const timestamp = new Date().toISOString();
    const userTempId = `local-user-${Date.now()}`;
    const assistantTempId = `${userTempId}-assistant`;

    setInput("");
    setSending(true);
    setStatus(null);
    setKnowledgeRefs([]);
    setSyncLocked(true);

    appendMessage({ id: userTempId, role: "user", content: text, created_at: timestamp, pending: true });
    appendMessage({ id: assistantTempId, role: "assistant", content: "", created_at: timestamp, pending: true });

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId: activeSessionId ?? undefined, message: text }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        setMessages((prev) => prev.filter((msg) => msg.id !== userTempId && msg.id !== assistantTempId));
        return;
      }

      if (!response.ok || !response.body) {
        const errorPayload = await response.json().catch(() => ({ error: "メッセージの送信に失敗しました" }));
        throw new Error(errorPayload.error ?? "メッセージの送信に失敗しました");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let streamingText = "";
      let resolvedSessionId = activeSessionId;

      const flushBuffer = () => {
        let boundary = buffer.indexOf("\n\n");
        while (boundary !== -1) {
          const chunk = buffer.slice(0, boundary).trim();
          buffer = buffer.slice(boundary + 2);
          if (chunk.startsWith("data:")) {
            const payload = JSON.parse(chunk.slice(5).trim()) as StreamPayload;
            if (payload.type === "delta" && payload.content) {
              streamingText += payload.content;
              updateMessage(assistantTempId, (msg) => ({ ...msg, content: streamingText }));
            }
            if (payload.type === "meta") {
              if (payload.sessionId) {
                resolvedSessionId = payload.sessionId;
                setActiveSessionId(payload.sessionId);
              }
              if (payload.knowledge) {
                setKnowledgeRefs(payload.knowledge);
              }
            }
            if (payload.type === "error") {
              throw new Error(payload.message || "メッセージの送信に失敗しました");
            }
          }
          boundary = buffer.indexOf("\n\n");
        }
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        flushBuffer();
      }

      flushBuffer();

      updateMessage(userTempId, (msg) => ({ ...msg, pending: false }));
      updateMessage(assistantTempId, (msg) => ({ ...msg, pending: false }));

      if (resolvedSessionId) {
        void loadSessions({ skipAutoSelect: true });
      }
    } catch (error) {
      console.error(error);
      setStatus((error as Error).message);
      setMessages((prev) => prev.filter((msg) => msg.id !== userTempId && msg.id !== assistantTempId));
    } finally {
      setSending(false);
      setSyncLocked(false);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setSyncLocked(false);
    setActiveSessionId(sessionId);
    setKnowledgeRefs([]);
  };

  const renderSessions = () => {
    if (needsAuth) {
      return <p className="text-sm text-muted-foreground">ログイン後に会話履歴が表示されます。</p>;
    }

    if (sessionsLoading) {
      return <p className="text-sm text-muted-foreground">読み込み中...</p>;
    }

    if (!sessions.length) {
      return <p className="text-sm text-muted-foreground">まだ会話がありません。</p>;
    }

    return (
      <ul className="space-y-2">
        {sessions.map((session) => (
          <li key={session.id}>
            <button
              type="button"
              className={cn(
                "w-full rounded-md border px-3 py-2 text-left transition",
                activeSessionId === session.id ? "border-primary bg-primary/10" : "border-border hover:bg-muted",
              )}
              onClick={() => handleSessionSelect(session.id)}
            >
              <p className="text-sm font-medium">{session.title || "名称未設定のセッション"}</p>
              <p className="text-xs text-muted-foreground">{formatRelativeTime(session.updated_at)}</p>
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const renderMessages = () => {
    if (needsAuth) {
      return <p className="text-sm text-muted-foreground">ログイン後にチャットを開始できます。</p>;
    }

    if (!activeSessionId && !messages.length) {
      return (
        <div className="text-center text-muted-foreground">
          <p>新しい相談を開始してみましょう。</p>
        </div>
      );
    }

    if (!messages.length) {
      return <p className="text-sm text-muted-foreground">まだメッセージはありません。</p>;
    }

    return (
      <div className="space-y-4">
        {messagesLoading && <p className="text-xs text-muted-foreground">会話を同期しています...</p>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}
          >
            <div
              className={cn(
                "max-w-full rounded-lg px-4 py-2 text-sm shadow-sm",
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content || " "}</p>
              <p
                className={cn(
                  "mt-1 text-right text-[11px]",
                  message.role === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                )}
              >
                {message.pending ? "送信中..." : formatRelativeTime(message.created_at)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold">会話一覧</p>
            <p className="text-xs text-muted-foreground">最新順に表示します</p>
          </div>
          <Button size="sm" variant="outline" onClick={handleNewConversation}>
            新規
          </Button>
        </div>
        {renderSessions()}
      </aside>

      <section className="flex flex-col rounded-xl border bg-card p-4 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold">{activeSession?.title || "カウンセリング"}</p>
            <p className="text-xs text-muted-foreground">
              {needsAuth ? "ログインが必要です" : "あなたのペースでご相談ください"}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border bg-background p-4">
          {renderMessages()}
          {knowledgeRefs.length > 0 && (
            <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
              <p className="mb-2 font-semibold text-foreground">参考情報</p>
              <ul className="space-y-2">
                {knowledgeRefs.map((ref) => (
                  <li key={ref.id} className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="font-semibold text-foreground">
                        {Math.round(ref.similarity * 100)}%
                      </span>
                      {ref.source && <span className="truncate text-muted-foreground">{ref.source}</span>}
                    </div>
                    <p className="text-muted-foreground">{ref.preview}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <form
          className="mt-4 flex flex-col gap-3 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <textarea
            className="h-24 w-full resize-none rounded-md border bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            placeholder={needsAuth ? "ログイン後に入力できます" : "今感じていることを自由に書いてください"}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={sending || needsAuth}
          />
          <Button className="md:w-32" type="submit" disabled={sending || needsAuth}>
            {sending ? "送信中..." : "送信"}
          </Button>
        </form>

        {status && <p className="mt-2 text-sm text-destructive">{status}</p>}
      </section>
    </div>
  );
}

function formatRelativeTime(isoString: string) {
  const date = new Date(isoString);
  if (Number.isNaN(date.getTime())) {
    return isoString;
  }

  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "たった今";
  if (minutes < 60) return `${minutes}分前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}時間前`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}日前`;
  return date.toLocaleDateString("ja-JP", { month: "short", day: "numeric" });
}
