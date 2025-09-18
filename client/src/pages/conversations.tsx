import { useState } from "react";
import { ConversationList } from "@/components/conversation-list";
import { ChatView } from "@/components/chat-view";
import { motion } from "framer-motion";

export default function Conversations() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full p-6"
    >
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Conversations</h1>
        <p className="text-muted-foreground">Monitor and manage customer conversations across all channels.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-[calc(100vh-200px)]">
        <ConversationList onSelectConversation={setSelectedConversation} />
        {selectedConversation ? (
          <ChatView conversationId={selectedConversation} />
        ) : (
          <div className="flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
            <p className="text-muted-foreground">Select a conversation to view details</p>
          </div>
        )}
      </div>
    </motion.div>
  );
}