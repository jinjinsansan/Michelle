"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TapeResponse } from "@/lib/ai/prompt";

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
  structured?: TapeResponse | null;
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
  structured?: TapeResponse | null;
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
  const [autoSelectSession, setAutoSelectSession] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

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
        if (!options?.skipAutoSelect && autoSelectSession && !activeSessionId && data.sessions.length) {
          setActiveSessionId(data.sessions[0].id);
        }
      } catch (error) {
        console.error(error);
        setStatus((error as Error).message);
      } finally {
        setSessionsLoading(false);
      }
    },
    [activeSessionId, autoSelectSession, handleUnauthorized],
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
    if (!activeSessionId) {
      return;
    }
    loadMessages(activeSessionId);
  }, [activeSessionId, loadMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleNewConversation = () => {
    setActiveSessionId(null);
    setMessages([]);
    setKnowledgeRefs([]);
    setStatus(null);
    setAutoSelectSession(false);
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
              if (payload.structured) {
                updateMessage(assistantTempId, (msg) => ({ ...msg, structured: payload.structured }));
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
        setAutoSelectSession(true);
        void loadSessions({ skipAutoSelect: true });
      }
    } catch (error) {
      console.error(error);
      setStatus((error as Error).message);
      setMessages((prev) => prev.filter((msg) => msg.id !== userTempId && msg.id !== assistantTempId));
    } finally {
      setSending(false);
    }
  };

  const handleSessionSelect = (sessionId: string) => {
    setActiveSessionId(sessionId);
    setKnowledgeRefs([]);
    setAutoSelectSession(true);
  };

  const renderSessions = () => {
    if (needsAuth) {
      return (
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">ログイン後に会話履歴が表示されます。</p>
        </div>
      );
    }

    if (sessionsLoading) {
      return (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 animate-pulse rounded-lg bg-muted/50" />
          ))}
        </div>
      );
    }

    if (!sessions.length) {
      return (
        <div className="rounded-lg bg-muted/50 p-4 text-center">
          <p className="text-sm text-muted-foreground">まだ会話がありません。</p>
        </div>
      );
    }

    return (
      <AnimatePresence mode="popLayout">
        <motion.ul className="space-y-2">
          {sessions.map((session, index) => (
            <motion.li
              key={session.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ delay: index * 0.05, duration: 0.3 }}
            >
              <button
                type="button"
                className={cn(
                  "group w-full rounded-xl border px-4 py-3 text-left transition-all duration-200",
                  activeSessionId === session.id
                    ? "border-primary/50 bg-primary/10 shadow-md"
                    : "border-border/50 hover:border-primary/30 hover:bg-muted/50 hover:shadow-sm",
                )}
                onClick={() => handleSessionSelect(session.id)}
              >
                <p className="truncate text-sm font-medium text-foreground group-hover:text-primary">
                  {session.title || "名称未設定のセッション"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{formatRelativeTime(session.updated_at)}</p>
              </button>
            </motion.li>
          ))}
        </motion.ul>
      </AnimatePresence>
    );
  };

  const renderMessages = () => {
    if (needsAuth) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">ログイン後にチャットを開始できます。</p>
        </div>
      );
    }

    if (!activeSessionId && !messages.length) {
      return (
        <div className="flex h-full items-center justify-center text-center text-muted-foreground">
          <div>
            <p className="text-lg font-medium">新しい相談を開始してみましょう</p>
            <p className="mt-2 text-sm">今感じていることを、自由に書いてください。</p>
          </div>
        </div>
      );
    }

    if (!messages.length) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-sm text-muted-foreground">まだメッセージはありません。</p>
        </div>
      );
    }

    return (
      <>
        {messagesLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4"
          >
            <p className="text-xs text-muted-foreground">会話を同期しています...</p>
          </motion.div>
        )}
        <AnimatePresence mode="popLayout">
          {messages.map((message, index) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className={cn("mb-6 flex", message.role === "user" ? "justify-end" : "justify-start")}
            >
              {message.role === "user" ? (
                <div className="max-w-[85%] rounded-2xl bg-gradient-to-br from-primary to-primary/90 px-5 py-3 shadow-md">
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-primary-foreground">
                    {message.content || " "}
                  </p>
                  <p className="mt-2 text-right text-[10px] text-primary-foreground/60">
                    {message.pending ? "送信中..." : formatRelativeTime(message.created_at)}
                  </p>
                </div>
              ) : (
                <div className="max-w-[90%] space-y-3 rounded-2xl bg-gradient-to-br from-muted/50 to-muted/30 p-5 shadow-md backdrop-blur-sm">
                  {message.structured ? (
                    <div className="space-y-4">
                      <Section
                        title="感情の鏡"
                        emoji="🪞"
                        content={message.structured.emotionMirror}
                        delay={0}
                      />
                      <Section
                        title="状態の共有"
                        emoji="🌊"
                        content={message.structured.stateObservation}
                        delay={0.1}
                      />
                      <Section
                        title="気づきのヒント"
                        emoji="💡"
                        content={message.structured.insight}
                        delay={0.2}
                      />
                      <Section
                        title="問いかけ"
                        emoji="❓"
                        content={message.structured.question}
                        delay={0.3}
                      />
                      <Section
                        title="選択と主体性"
                        emoji="🌱"
                        content={message.structured.agency}
                        delay={0.4}
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                        {message.content || " "}
                      </p>
                      {message.pending && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
                          応答を生成中...
                        </div>
                      )}
                    </div>
                  )}
                  <p className="mt-2 text-right text-[10px] text-muted-foreground">
                    {message.pending ? "" : formatRelativeTime(message.created_at)}
                  </p>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </>
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
      <motion.aside
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-2xl border border-border/50 bg-card/50 p-5 shadow-lg backdrop-blur-sm"
      >
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-foreground">会話一覧</p>
            <p className="text-xs text-muted-foreground">最新順に表示</p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleNewConversation}
            className="rounded-lg hover:bg-primary/10"
          >
            新規
          </Button>
        </div>
        {renderSessions()}
      </motion.aside>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col rounded-2xl border border-border/50 bg-card/50 p-6 shadow-lg backdrop-blur-sm"
      >
        <div className="mb-5 flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground">{activeSession?.title || "カウンセリング"}</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              {needsAuth ? "ログインが必要です" : "あなたのペースでご相談ください"}
            </p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto rounded-xl bg-background/50 p-6">
          {renderMessages()}
        </div>

        <AnimatePresence>
          {knowledgeRefs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 overflow-hidden rounded-xl border border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10 p-4 shadow-sm"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-lg">📚</span>
                <p className="text-sm font-semibold text-foreground">参考情報</p>
              </div>
              <ul className="space-y-3">
                {knowledgeRefs.map((ref, index) => (
                  <motion.li
                    key={ref.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    className="rounded-lg bg-background/60 p-3 text-xs"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
                        {Math.round(ref.similarity * 100)}%
                      </span>
                      {ref.source && (
                        <span className="truncate text-[11px] text-muted-foreground">{ref.source}</span>
                      )}
                    </div>
                    <p className="leading-relaxed text-muted-foreground">{ref.preview}</p>
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>

        <form
          className="mt-5 flex flex-col gap-3 md:flex-row"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <textarea
            className="h-28 w-full resize-none rounded-xl border border-border/50 bg-background/80 p-4 text-sm shadow-sm backdrop-blur-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            placeholder={needsAuth ? "ログイン後に入力できます" : "今感じていることを、自由に書いてください..."}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            disabled={sending || needsAuth}
            onKeyDown={(event) => {
              if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                handleSend();
              }
            }}
          />
          <Button
            className="rounded-xl shadow-md transition-all hover:shadow-lg md:w-36"
            type="submit"
            disabled={sending || needsAuth}
          >
            {sending ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                送信中...
              </span>
            ) : (
              "送信"
            )}
          </Button>
        </form>

        {status && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-3 text-sm text-destructive"
          >
            {status}
          </motion.p>
        )}
      </motion.section>
    </div>
  );
}

function Section({
  title,
  emoji,
  content,
  delay,
}: {
  title: string;
  emoji: string;
  content: string;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4, ease: "easeOut" }}
      className="border-l-4 border-primary/30 pl-4"
    >
      <div className="mb-1 flex items-center gap-2">
        <span className="text-lg">{emoji}</span>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h4>
      </div>
      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{content}</p>
    </motion.div>
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
