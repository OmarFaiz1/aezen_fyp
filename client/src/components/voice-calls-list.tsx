import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Phone, UserCheck, AlertTriangle, Smile, Frown, Meh } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

// todo: remove mock functionality
const mockCalls = [
  { callId: 1, caller: 'Customer A', sentiment: 'positive', duration: '5min 30s', type: 'inbound', status: 'completed', timestamp: '2023-09-01 10:30' },
  { callId: 2, caller: 'Customer B', sentiment: 'negative', duration: '8min 15s', type: 'inbound', status: 'escalated', timestamp: '2023-09-01 11:45' },
  { callId: 3, caller: 'Customer C', sentiment: 'neutral', duration: '3min 22s', type: 'outbound', status: 'completed', timestamp: '2023-09-01 14:20' },
  { callId: 4, caller: 'Customer D', sentiment: 'negative', duration: '12min 45s', type: 'inbound', status: 'in-progress', timestamp: '2023-09-01 15:10' },
];

const sentimentColors = {
  positive: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  neutral: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  negative: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const sentimentIcons = {
  positive: Smile,
  neutral: Meh,
  negative: Frown,
};

const statusColors = {
  completed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  'in-progress': "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  escalated: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
};

export function VoiceCallsList() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sentimentFilter, setSentimentFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  const filteredCalls = mockCalls.filter(call =>
    call.caller.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (sentimentFilter === "all" || call.sentiment === sentimentFilter) &&
    (typeFilter === "all" || call.type === typeFilter)
  );

  const handleHumanTakeover = (callId: number) => {
    // todo: remove mock functionality
    console.log("Human takeover for call:", callId);
    toast({
      title: "Human Takeover Initiated",
      description: `Call ${callId} has been escalated to a human agent.`,
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card data-testid="card-voice-calls-list">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Voice Calls Monitoring
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search calls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-calls"
              />
            </div>
            <Select value={sentimentFilter} onValueChange={setSentimentFilter}>
              <SelectTrigger className="w-32" data-testid="select-sentiment-filter">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="positive">Positive</SelectItem>
                <SelectItem value="neutral">Neutral</SelectItem>
                <SelectItem value="negative">Negative</SelectItem>
              </SelectContent>
            </Select>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-32" data-testid="select-type-filter">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="inbound">Inbound</SelectItem>
                <SelectItem value="outbound">Outbound</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCalls.map((call) => {
              const SentimentIcon = sentimentIcons[call.sentiment as keyof typeof sentimentIcons];
              return (
                <motion.div
                  key={call.callId}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                  data-testid={`call-row-${call.callId}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <Phone className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{call.caller}</p>
                      <p className="text-sm text-muted-foreground">
                        {call.type} • {call.duration} • {new Date(call.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary"
                        className={sentimentColors[call.sentiment as keyof typeof sentimentColors]}
                      >
                        <SentimentIcon className="h-3 w-3 mr-1" />
                        {call.sentiment}
                      </Badge>
                      <Badge 
                        variant="secondary"
                        className={statusColors[call.status as keyof typeof statusColors]}
                      >
                        {call.status}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {call.status === 'in-progress' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleHumanTakeover(call.callId)}
                        data-testid={`button-takeover-${call.callId}`}
                      >
                        <UserCheck className="h-4 w-4 mr-2" />
                        Takeover
                      </Button>
                    )}
                    {call.sentiment === 'negative' && (
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}