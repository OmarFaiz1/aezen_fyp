// src/pages/conversations.tsx
import { useState, useEffect } from "react";
import { ConversationList } from "@/components/conversation-list";
import { ChatView } from "@/components/chat-view";
import { motion } from "framer-motion";
import { useLocation } from "wouter";

export default function Conversations() {
  const [location] = useLocation();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) {
      setSelectedConversation(id);
    }
  }, [location]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col p-6 h-auto lg:h-[calc(100vh-4rem)] lg:overflow-hidden">
      <div className="mb-6 flex-none">
        <h1 className="text-3xl font-bold">Conversations</h1>
        <p className="text-muted-foreground">Real-time WhatsApp messaging</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
        <div className="h-full overflow-hidden">
          <ConversationList onSelectConversation={setSelectedConversation} selectedId={selectedConversation} />
        </div>
        <div className="h-full overflow-hidden">
          {selectedConversation ? (
            <ChatView conversationId={selectedConversation} />
          ) : (
            <div className="flex h-full items-center justify-center border-2 border-dashed rounded-lg">
              <p className="text-muted-foreground">Select a conversation</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}