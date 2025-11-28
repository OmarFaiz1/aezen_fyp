// src/components/chat-view.tsx
import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Send, Image as ImageIcon } from "lucide-react";
import { CreateTicketDialog } from "./create-ticket-dialog";
import { useQuery, useMutation } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { apiRequest } from "@/lib/queryClient";

interface Message {
  id: string;
  body: string; // or content
  content: string;
  fromMe: boolean; // or sender === 'agent'
  sender: string;
  timestamp: string; // or createdAt
  createdAt: string;
  type: 'text' | 'image';
}

interface Conversation {
  id: string;
  platform: 'whatsapp' | 'web';
  contactNumber?: string;
  contactName?: string;
  ticketId?: string;
  ticketNumber?: string;
}

import { TicketDetailsDialog } from "./ticket-details-dialog";

export function ChatView({ conversationId }: { conversationId: string }) {
  const [message, setMessage] = useState("");
  const [createTicketOpen, setCreateTicketOpen] = useState(false);
  const [viewTicketId, setViewTicketId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch conversation details to know platform
  const { data: conversation } = useQuery<Conversation>({
    queryKey: [`/api/conversations/${conversationId}`],
  });

  const { data: messages = [], refetch } = useQuery<Message[]>({
    queryKey: [`/api/conversations/${conversationId}/messages`],
    refetchInterval: 3000,
  });

  // Mark as read when conversation opens
  useEffect(() => {
    if (conversationId) {
      apiRequest("POST", `/api/conversations/${conversationId}/read`, {});
    }
  }, [conversationId]);

  const sendMutation = useMutation({
    mutationFn: async (text: string) => {
      if (conversation?.platform === 'whatsapp') {
        return apiRequest("POST", "/integrations/whatsapp/send", {
          conversationId,
          content: text,
        });
      } else {
        return apiRequest("POST", `/api/conversations/${conversationId}/send`, { text });
      }
    },
    onSuccess: () => {
      setMessage("");
      refetch();
    },
  });

  useEffect(() => {
    const socket = getSocket();
    const handler = (data: { conversationId?: string, chatId?: string }) => {
      if (data.conversationId === conversationId || data.chatId === conversationId) {
        refetch();
        // Also mark as read if we are looking at this conversation
        apiRequest("POST", `/api/conversations/${conversationId}/read`, {});
      }
    };

    socket.on("message:new", handler);
    socket.on("incoming_message", handler);
    socket.on("member_sent_message", handler);

    return () => {
      socket.off("message:new", handler);
      socket.off("incoming_message", handler);
      socket.off("member_sent_message", handler);
    };
  }, [conversationId, refetch]);

  useEffect(() => {
    scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
  }, [messages]);

  const send = () => {
    if (message.trim()) sendMutation.mutate(message.trim());
  };

  const isWhatsApp = conversation?.platform === 'whatsapp';

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback>{(conversation?.contactName || conversation?.contactNumber || conversationId).slice(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{conversation?.contactName || conversation?.contactNumber || conversationId}</p>
              <p className={`text-sm ${isWhatsApp ? "text-green-600" : "text-blue-600"}`}>
                {isWhatsApp ? "WhatsApp" : "Web Chat"}
              </p>
            </div>
          </div>
          {conversation?.ticketId ? (
            <Button variant="outline" size="sm" onClick={() => conversation.ticketId && setViewTicketId(conversation.ticketId)}>
              Ticket #{conversation.ticketNumber}
            </Button>
          ) : (
            <Button variant="outline" size="sm" onClick={() => setCreateTicketOpen(true)}>
              Create Ticket
            </Button>
          )}
        </div>
      </CardHeader>

      <CreateTicketDialog
        open={createTicketOpen}
        onOpenChange={setCreateTicketOpen}
        conversationId={conversationId}
      />

      <TicketDetailsDialog
        open={!!viewTicketId}
        onOpenChange={(open) => !open && setViewTicketId(null)}
        ticketId={viewTicketId}
      />

      <CardContent className="flex-1 flex flex-col p-0 overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isMe = msg.fromMe || msg.sender === 'agent';
            const content = msg.content || msg.body;
            const time = msg.createdAt || msg.timestamp;

            return (
              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${isMe
                    ? (isWhatsApp ? "bg-green-100 text-green-900" : "bg-primary text-primary-foreground")
                    : "bg-muted"
                    }`}
                >
                  {msg.type === 'image' ? (
                    <div className="mb-1">
                      <ImageIcon className="h-12 w-12 opacity-50" />
                      <span className="text-xs">[Image]</span>
                    </div>
                  ) : (
                    <p>{content}</p>
                  )}
                  <p className="text-xs opacity-70 mt-1 text-right">
                    {new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t p-4 bg-background">
          <div className="flex gap-2">
            <Input
              placeholder={isWhatsApp ? "Type a WhatsApp message..." : "Type a message..."}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
            />
            <Button onClick={send} disabled={!message.trim() || sendMutation.isPending}
              className={isWhatsApp ? "bg-green-600 hover:bg-green-700" : ""}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}