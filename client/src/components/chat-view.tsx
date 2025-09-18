import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, Paperclip, Mic, Phone, VideoIcon } from "lucide-react";
import { motion } from "framer-motion";

// todo: remove mock functionality
const mockMessages = [
  { id: 1, sender: 'customer', content: 'Hi, I need help with my order', timestamp: '10:30 AM', type: 'text' },
  { id: 2, sender: 'bot', content: 'Hello! I can help you with that. Can you provide your order number?', timestamp: '10:30 AM', type: 'text' },
  { id: 3, sender: 'customer', content: 'ORD123456', timestamp: '10:31 AM', type: 'text' },
  { id: 4, sender: 'bot', content: 'Great! I found your order. It was shipped yesterday and should arrive tomorrow.', timestamp: '10:31 AM', type: 'text' },
  { id: 5, sender: 'customer', content: 'Thank you!', timestamp: '10:32 AM', type: 'text' },
];

interface ChatViewProps {
  conversationId?: number;
  customerName?: string;
  channel?: string;
}

export function ChatView({ conversationId, customerName = "John Doe", channel = "WhatsApp" }: ChatViewProps) {
  const [newMessage, setNewMessage] = useState("");
  const [messages] = useState(mockMessages);

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    // todo: remove mock functionality
    console.log("Send message:", newMessage);
    setNewMessage("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="h-[600px] flex flex-col" data-testid="card-chat-view">
        <CardHeader className="flex-shrink-0 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src="" />
                <AvatarFallback>{customerName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-base">{customerName}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{channel}</Badge>
                  <span className="text-xs text-green-600">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" data-testid="button-voice-call">
                <Phone className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-video-call">
                <VideoIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-4 space-y-3" data-testid="chat-messages">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.sender === 'customer' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                  message.sender === 'customer' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted'
                }`}>
                  <p className="text-sm">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">{message.timestamp}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex-shrink-0 border-t p-4">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" data-testid="button-attach">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" data-testid="button-voice-message">
                <Mic className="h-4 w-4" />
              </Button>
              <Input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                data-testid="input-chat-message"
              />
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim()}
                data-testid="button-send-message"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}