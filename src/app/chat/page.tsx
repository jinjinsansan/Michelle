import ChatClient from "./chat-client";

export default function ChatPage() {
  return (
    <div className="h-[calc(100vh-64px)] w-full bg-background">
      <ChatClient />
    </div>
  );
}
