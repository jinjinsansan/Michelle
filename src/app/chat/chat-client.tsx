"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Menu, Plus, Send, MessageSquare, Trash2, Share2, MoreHorizontal, X, Bot, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { TapeResponse } from "@/lib/ai/prompt";

// --- 型定義 ---
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
  // --- State ---
  const [sessions, setSessions] = useState<SessionSummary[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // モバイル用サイドバー
  
  const [isLoading, setIsLoading] = useState({
    sessions: false,
    messages: false,
    sending: false,
  });
  
  const [needsAuth, setNeedsAuth] = useState(false);
  const [knowledgeRefs, setKnowledgeRefs] = useState<KnowledgeReference[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- Hooks ---
  const activeSession = useMemo(
    () => sessions.find((session) => session.id === activeSessionId) ?? null,
    [sessions, activeSessionId],
  );

  // --- API Methods ---
  const loadSessions = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, sessions: true }));
    try {
      const res = await fetch("/api/sessions");
      if (res.status === 401) {
        setNeedsAuth(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to load sessions");
      const data = await res.json() as SessionsResponse;
      setSessions(data.sessions ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(prev => ({ ...prev, sessions: false }));
    }
  }, []);

  const loadMessages = useCallback(async (sessionId: string) => {
    setIsLoading(prev => ({ ...prev, messages: true }));
    try {
      const res = await fetch(`/api/sessions/${sessionId}/messages`);
      if (res.status === 401) {
        setNeedsAuth(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to load messages");
      const data = await res.json() as MessagesResponse;
      setMessages(data.messages ?? []);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(prev => ({ ...prev, messages: false }));
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (activeSessionId) {
      loadMessages(activeSessionId);
    } else {
      setMessages([]);
    }
  }, [activeSessionId, loadMessages]);

  // 自動スクロール
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading.sending]);

  // テキストエリアの高さ自動調整
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  // --- Handlers ---
  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setKnowledgeRefs([]);
    setIsSidebarOpen(false);
    // PCでも新規チャット時は入力フォーカス
    textareaRef.current?.focus();
  };

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading.sending) return;

    const text = input.trim();
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";

    const tempUserId = `temp-user-${Date.now()}`;
    const tempAiId = `temp-ai-${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 楽観的UI更新
    setMessages(prev => [
      ...prev,
      { id: tempUserId, role: "user", content: text, created_at: timestamp },
      { id: tempAiId, role: "assistant", content: "", created_at: timestamp, pending: true } // 空のAIメッセージ
    ]);

    setIsLoading(prev => ({ ...prev, sending: true }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: activeSessionId ?? undefined,
          message: text,
        }),
      });

      if (!res.ok || !res.body) throw new Error("Network error");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let aiContent = "";
      let newSessionId = activeSessionId;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n\n");
        
        for (const line of lines) {
          if (line.startsWith("data:")) {
            try {
              const data = JSON.parse(line.slice(5)) as StreamPayload;
              
              if (data.type === "meta" && data.sessionId) {
                newSessionId = data.sessionId;
                if (!activeSessionId) setActiveSessionId(data.sessionId); // 初回のみセット
              }
              
              if (data.type === "delta" && data.content) {
                aiContent += data.content;
                // ストリーミング更新
                setMessages(prev => prev.map(msg => 
                  msg.id === tempAiId 
                    ? { ...msg, content: aiContent } 
                    : msg
                ));
              }

              if (data.type === "meta" && data.knowledge) {
                setKnowledgeRefs(data.knowledge);
              }
            } catch (e) {
              // JSON parse error ignore
            }
          }
        }
      }

      // 完了処理
      setMessages(prev => prev.map(msg => 
        msg.id === tempAiId ? { ...msg, content: aiContent, pending: false } : msg
      ));

      // 初回チャットならセッションリストを再取得
      if (!activeSessionId && newSessionId) {
        loadSessions();
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map(msg => 
        msg.id === tempAiId ? { ...msg, content: "エラーが発生しました。もう一度お試しください。", pending: false } : msg
      ));
    } finally {
      setIsLoading(prev => ({ ...prev, sending: false }));
    }
  };

  const handleDeleteSession = async (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("このチャット履歴を削除しますか？")) return;

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete session");
      
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        handleNewChat();
      }
    } catch (error) {
      console.error(error);
      alert("削除に失敗しました");
    }
  };

  const handleShare = () => {
    if (!messages.length) return;
    
    const text = messages.map(m => 
      `${m.role === "user" ? "あなた" : "ミシェル"}: ${m.content}`
    ).join("\n\n");
    
    navigator.clipboard.writeText(text).then(() => {
      alert("会話内容をクリップボードにコピーしました");
    }).catch(() => {
      alert("コピーに失敗しました");
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // --- Render ---
  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden bg-background text-foreground">
      {/* --- Sidebar (PC) --- */}
      <aside className="hidden w-[260px] flex-col bg-muted/30 border-r border-border md:flex">
        <div className="p-3">
          <Button 
            onClick={handleNewChat} 
            variant="outline" 
            className="w-full justify-start gap-2 border-primary/20 bg-background hover:bg-primary/5 hover:text-primary"
          >
            <Plus className="h-4 w-4" />
            新しいチャット
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-3 py-2">
          <div className="mb-2 text-xs font-medium text-muted-foreground/70 px-2">履歴</div>
          <div className="space-y-1">
            {sessions.map(session => (
              <button
                key={session.id}
                onClick={() => setActiveSessionId(session.id)}
                className={cn(
                  "group flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm transition-all",
                  activeSessionId === session.id 
                    ? "bg-primary/10 text-primary font-medium" 
                    : "hover:bg-muted/50 text-foreground/80"
                )}
              >
                <MessageSquare className="h-4 w-4 shrink-0 opacity-50" />
                <span className="truncate flex-1">{session.title || "新しいチャット"}</span>
                <div 
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-background/50 rounded"
                  onClick={(e) => handleDeleteSession(session.id, e)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-border/50">
          {/* ここにユーザー設定などを入れる */}
          <div className="flex items-center gap-2 rounded-lg p-2 text-sm text-muted-foreground">
            <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium text-foreground">ユーザー</span>
          </div>
        </div>
      </aside>

      {/* --- Mobile Sidebar (Overlay) --- */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative flex w-[80%] max-w-[300px] flex-col bg-background shadow-2xl">
            <div className="flex items-center justify-between p-4 border-b">
              <span className="font-semibold">メニュー</span>
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4">
              <Button onClick={handleNewChat} className="w-full gap-2">
                <Plus className="h-4 w-4" /> 新しいチャット
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto px-2">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => {
                    setActiveSessionId(session.id);
                    setIsSidebarOpen(false);
                  }}
                  className="group flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm hover:bg-muted"
                >
                  <MessageSquare className="h-4 w-4 text-muted-foreground" />
                  <span className="truncate flex-1 text-left">{session.title || "新しいチャット"}</span>
                  <div 
                    className="p-1"
                    onClick={(e) => handleDeleteSession(session.id, e)}
                  >
                    <Trash2 className="h-4 w-4 text-muted-foreground/50" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col relative bg-background min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between p-3 border-b bg-background/80 backdrop-blur-md sticky top-0 z-10 h-14">
          <div className="flex items-center gap-2 overflow-hidden">
            <Button variant="ghost" size="icon" className="md:hidden shrink-0" onClick={() => setIsSidebarOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-medium text-sm truncate">
              {activeSession?.title || "ミシェルAI"}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {messages.length > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleShare} 
                className="text-muted-foreground hover:text-foreground"
                title="会話内容をコピー"
              >
                <Share2 className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">共有</span>
              </Button>
            )}
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center shadow-sm">
                <Bot className="h-10 w-10 text-primary" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold tracking-tight text-foreground">こんにちは、ミシェルです</h2>
                <p className="text-muted-foreground max-w-md">
                  心のモヤモヤ、誰にも言えない悩み、なんでも話してください。<br/>
                  私はあなたの鏡となって、一緒に答えを探します。
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl mt-8">
                {["会社の上司に怒られた...", "最近なんだか寂しい", "将来が不安で眠れない", "自分が何をしたいか分からない"].map((q, i) => (
                  <button 
                    key={i} 
                    className="p-4 rounded-xl border bg-card hover:bg-muted/50 text-sm text-left transition-colors shadow-sm hover:shadow-md"
                    onClick={() => {
                      setInput(q);
                      // focus input
                      textareaRef.current?.focus();
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-6 p-4 md:p-6 max-w-3xl mx-auto w-full pb-32">
              {messages.map((msg, idx) => (
                <div 
                  key={msg.id} 
                  className={cn(
                    "flex w-full gap-4", 
                    msg.role === "user" ? "justify-end" : "justify-start"
                  )}
                >
                  {/* Avatar (AI) */}
                  {msg.role === "assistant" && (
                    <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}

                  <div className={cn(
                    "relative max-w-[85%] md:max-w-[75%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm",
                    msg.role === "user" 
                      ? "bg-primary text-primary-foreground rounded-tr-sm" 
                      : "bg-white dark:bg-muted border border-border/50 rounded-tl-sm"
                  )}>
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    {msg.pending && (
                      <span className="inline-block w-1.5 h-4 ml-1 bg-current animate-pulse align-middle" />
                    )}
                  </div>

                  {/* Avatar (User) */}
                  {msg.role === "user" && (
                    <div className="h-8 w-8 shrink-0 rounded-full bg-muted flex items-center justify-center border border-border">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {/* Knowledge References (if any) */}
              {knowledgeRefs.length > 0 && (
                <div className="mt-4 p-4 rounded-lg bg-muted/30 border text-xs text-muted-foreground max-w-3xl mx-auto w-full">
                  <p className="font-semibold mb-2 flex items-center gap-2">
                    <Bot className="h-3 w-3" /> 参考にした知識
                  </p>
                  <ul className="space-y-1 list-disc list-inside pl-2">
                    {knowledgeRefs.map(ref => (
                      <li key={ref.id} className="truncate" title={ref.preview}>
                        {ref.preview.slice(0, 60)}...
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-background/80 backdrop-blur-lg border-t absolute bottom-0 left-0 right-0 w-full">
          <div className="max-w-3xl mx-auto relative">
            <form 
              onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
              className="relative flex items-end gap-2 rounded-xl border bg-background p-2 shadow-sm focus-within:ring-2 focus-within:ring-primary/30 transition-all"
            >
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ミシェルに話しかける..."
                className="flex-1 max-h-48 min-h-[24px] w-full resize-none border-0 bg-transparent p-2 placeholder:text-muted-foreground focus:outline-none text-sm leading-relaxed"
                rows={1}
              />
              <Button 
                type="submit" 
                size="icon" 
                disabled={!input.trim() || isLoading.sending}
                className={cn(
                  "h-8 w-8 rounded-lg transition-all shrink-0 mb-1",
                  input.trim() ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted"
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>
            <div className="text-center mt-2">
              <p className="text-[10px] text-muted-foreground/60">
                ミシェルAIは誤った情報を生成する可能性があります。重要な判断は専門家に相談してください。
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
