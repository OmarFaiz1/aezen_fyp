import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageSquare, Filter } from "lucide-react";
import { motion } from "framer-motion";

// todo: remove mock functionality
const mockConversations = [
  { 
    id: 1, 
    channel: 'WhatsApp', 
    user: 'John Doe', 
    lastMessage: 'Where is my order?', 
    timestamp: '2h ago', 
    team: 'Support',
    unread: true,
    status: 'active'
  },
  { 
    id: 2, 
    channel: 'Instagram', 
    user: 'Jane Smith', 
    lastMessage: 'Thanks for the help!', 
    timestamp: '1h ago', 
    team: 'Sales',
    unread: false,
    status: 'resolved'
  },
  { 
    id: 3, 
    channel: 'Messenger', 
    user: 'Mike Johnson', 
    lastMessage: 'Can I get a refund?', 
    timestamp: '30m ago', 
    team: 'Support',
    unread: true,
    status: 'escalated'
  },
];

const channelColors = {
  WhatsApp: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Instagram: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300",
  Messenger: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Slack: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
};

const statusColors = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  resolved: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  escalated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

interface ConversationListProps {
  onSelectConversation?: (id: number) => void;
}

export function ConversationList({ onSelectConversation }: ConversationListProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedChannel, setSelectedChannel] = useState("all");
  const [selectedTeam, setSelectedTeam] = useState("all");

  const filteredConversations = mockConversations.filter(conv =>
    (conv.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
     conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (selectedChannel === "all" || conv.channel === selectedChannel) &&
    (selectedTeam === "all" || conv.team === selectedTeam)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card data-testid="card-conversation-list">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Conversations
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-conversations"
              />
            </div>
            <Select value={selectedChannel} onValueChange={setSelectedChannel}>
              <SelectTrigger className="w-32" data-testid="select-channel-filter">
                <SelectValue placeholder="Channel" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                <SelectItem value="Instagram">Instagram</SelectItem>
                <SelectItem value="Messenger">Messenger</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTeam} onValueChange={setSelectedTeam}>
              <SelectTrigger className="w-32" data-testid="select-team-filter">
                <SelectValue placeholder="Team" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="Support">Support</SelectItem>
                <SelectItem value="Sales">Sales</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredConversations.map((conversation) => (
              <motion.div
                key={conversation.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`p-3 border rounded-lg cursor-pointer hover-elevate ${
                  conversation.unread ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                }`}
                onClick={() => onSelectConversation?.(conversation.id)}
                data-testid={`conversation-item-${conversation.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium">{conversation.user}</p>
                      <Badge 
                        variant="secondary"
                        className={channelColors[conversation.channel as keyof typeof channelColors]}
                      >
                        {conversation.channel}
                      </Badge>
                      <Badge 
                        variant="secondary"
                        className={statusColors[conversation.status as keyof typeof statusColors]}
                      >
                        {conversation.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-muted-foreground">
                        {conversation.team} • {conversation.timestamp}
                      </span>
                      {conversation.unread && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}