// src/components/conversation-list.tsx
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Phone, Globe } from "lucide-react";
import { motion } from "framer-motion";
import { getSocket } from "@/lib/socket";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface Conversation {
  id: string;
  contactNumber: string;
  contactName: string;
  lastMessage?: string;
  lastMessageAt?: string; // backend sends Date, but JSON is string
  unreadCount: number;
  platform: 'whatsapp' | 'web';
}

export function ConversationList({ onSelectConversation, selectedId }: { onSelectConversation: (id: string) => void, selectedId?: string | null }) {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<'all' | 'whatsapp' | 'web'>('all');

  const { data: conversations = [], refetch } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
    refetchInterval: 8000,
  });

  useEffect(() => {
    const socket = getSocket();
    const refresh = () => {
      console.log('CONVERSATION LIST REFRESH TRIGGERED');
      refetch();
    };

    socket.on("chat:updated", refresh);
    socket.on("message:new", refresh);

    // WhatsApp Events
    socket.on("incoming_message", refresh);
    socket.on("member_sent_message", refresh);
    socket.on("whatsapp_connected", refresh);

    return () => {
      socket.off("chat:updated", refresh);
      socket.off("message:new", refresh);
      socket.off("incoming_message", refresh);
      socket.off("member_sent_message", refresh);
      socket.off("whatsapp_connected", refresh);
    };
  }, [refetch]);

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/conversations/read-all", {});
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/conversations"], (old: Conversation[] | undefined) => {
        if (!old) return [];
        return old.map(c => ({ ...c, unreadCount: 0 }));
      });
      refetch();
    }
  });

  const handleSelectConversation = (id: string) => {
    // Optimistic update
    queryClient.setQueryData(["/api/conversations"], (old: Conversation[] | undefined) => {
      if (!old) return [];
      return old.map(c => {
        if (c.id === id) {
          return { ...c, unreadCount: 0 };
        }
        return c;
      });
    });

    onSelectConversation(id);
  };

  const filteredConversations = conversations.filter(c => {
    if (filter === 'all') return true;
    return c.platform === filter;
  });

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full">
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Conversations
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 px-2"
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
            >
              Mark all read
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filter === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter('all')}
              className="flex-1"
            >
              All
            </Button>
            <Button
              variant={filter === 'whatsapp' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter('whatsapp')}
              className="flex-1"
            >
              <Phone className="h-3 w-3 mr-1" /> WA
            </Button>
            <Button
              variant={filter === 'web' ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter('web')}
              className="flex-1"
            >
              <Globe className="h-3 w-3 mr-1" /> Web
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto">
          <div className="space-y-3">
            {filteredConversations.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No conversations found</p>
            ) : (
              filteredConversations.map((conv) => (
                <motion.div
                  key={conv.id}
                  className={`p-3 border rounded-lg cursor-pointer hover:bg-muted/50 relative ${selectedId === conv.id ? "bg-muted border-primary/50" : ""}`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-1 h-10 rounded-full ${conv.platform === 'whatsapp' ? 'bg-green-500' : 'bg-blue-500'}`} />
                      <div className="overflow-hidden">
                        <p className="font-medium truncate">{conv.contactName || conv.contactNumber || "Unknown"}</p>
                        <p className="text-sm text-muted-foreground truncate">{conv.lastMessage || "No messages"}</p>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      {conv.unreadCount > 0 && (
                        <Badge variant="destructive" className="mb-1 block ml-auto w-fit">
                          {conv.unreadCount}
                        </Badge>
                      )}
                      <p className="text-xs text-muted-foreground whitespace-nowrap">
                        {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}