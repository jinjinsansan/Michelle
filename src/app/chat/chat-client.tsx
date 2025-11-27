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
};

type SessionsResponse = {
  sessions: SessionSummary[];
};

type MessagesResponse = {
  session: Pick<SessionSummary, "id" | "title" | "category">;
  messages: MessageItem[];
};

type ChatResponse = {
  sessionId: string;
  reply: string;
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

  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  const handleUnauthorized = useCallback(() => {
    setNeedsAuth(true);
    setStatus("この機能を利用するにはログインが必要です");
  }, []);

  const loadSessions = useCallback(async () => {
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
      if (!activeSessionId && data.sessions.length) {
        setActiveSessionId(data.sessions[0].id);
      }
    } catch (error) {
      console.error(error);
      setStatus((error as Error).message);
    } finally {
      setSessionsLoading(false);
    }
  }, [activeSessionId, handleUnauthorized]);

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
    if (!activeSessionId) {
      setMessages([]);
      return;
    }
    loadMessages(activeSessionId);
  }, [activeSessionId, loadMessages]);

  const handleNewConversation = () => {
    setActiveSessionId(null);
    setMessages([]);
    setStatus(null);
  };

  const handleSend = async () => {
    if (!input.trim() || sending || needsAuth) {
      return;
    }

    const message = input.trim();
    setInput("");
    setSending(true);
    setStatus(null);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId ?? undefined,
          message,
        }),
      });

      if (response.status === 401) {
        handleUnauthorized();
        return;
      }

      if (!response.ok) {
        throw new Error("メッセージの送信に失敗しました");
      }

      const data = (await response.json()) as ChatResponse;
      setActiveSessionId(data.sessionId);
      await loadSessions();
      await loadMessages(data.sessionId);
    } catch (error) {
      console.error(error);
      setStatus((error as Error).message);
    } finally {
      setSending(false);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId);
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
                activeSessionId === session.id
                  ? "border-primary bg-primary/10"
                  : "border-border hover:bg-muted",
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

    if (messagesLoading) {
      return <p className="text-sm text-muted-foreground">メッセージを読み込んでいます...</p>;
    }

    if (!messages.length) {
      return <p className="text-sm text-muted-foreground">まだメッセージはありません。</p>;
    }

    return (
      <div className="space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex",
              message.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                "max-w-full rounded-lg px-4 py-2 text-sm shadow-sm",
                message.role === "user"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-foreground",
              )}
            >
              <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
              <p
                className={cn(
                  "mt-1 text-right text-[11px]",
                  message.role === "user"
                    ? "text-primary-foreground/70"
                    : "text-muted-foreground",
                )}
              >
                {formatRelativeTime(message.created_at)}
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
            <p className="text-lg font-semibold">
              {activeSession?.title || "TapeAI カウンセリング"}
            </p>
            <p className="text-xs text-muted-foreground">
              {needsAuth ? "ログインが必要です" : "あなたのペースでご相談ください"}
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto rounded-lg border bg-background p-4">
          {renderMessages()}
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
