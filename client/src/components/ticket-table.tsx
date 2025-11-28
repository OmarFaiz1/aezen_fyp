import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageSquare, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  critical: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

const statusColors = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  'in-progress': "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  resolved: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

interface TicketTableProps {
  onViewTicket?: (id: string) => void;
  onChatWithTicket?: (conversationId: string) => void;
  endpoint?: string;
  title?: string;
}

export function TicketTable({ onViewTicket, onChatWithTicket, endpoint = "/api/tickets", title = "Support Tickets" }: TicketTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // ...

  const { data: tickets = [] } = useQuery<any[]>({
    queryKey: [endpoint, statusFilter, priorityFilter, searchTerm],
    queryFn: async () => {
      console.log(`[TicketTable] Fetching tickets from ${endpoint}`, { statusFilter, priorityFilter, searchTerm });
      const params = new URLSearchParams();
      if (statusFilter !== "all") params.append("status", statusFilter);
      if (priorityFilter !== "all") params.append("priority", priorityFilter);
      if (searchTerm) params.append("search", searchTerm);

      const res = await apiRequest("GET", `${endpoint}?${params.toString()}`);
      const data = await res.json();
      console.log(`[TicketTable] Fetched ${data.length} tickets`);
      return data;
    },
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card data-testid="card-ticket-table">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-tickets"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
              </SelectContent>
            </Select>
            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-32" data-testid="select-priority-filter">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {tickets.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No tickets found</p>
            ) : (
              tickets.map((ticket) => (
                <motion.div
                  key={ticket.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                  data-testid={`ticket-row-${ticket.id}`}
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="font-mono text-sm w-16">{ticket.ticketNumber}</div>
                    <div className="flex-1">
                      <p className="font-medium">{ticket.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Assigned to {ticket.assignedTo?.name || "Unassigned"} • {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant="secondary"
                      className={priorityColors[ticket.priority as keyof typeof priorityColors]}
                    >
                      {ticket.priority}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={statusColors[ticket.status as keyof typeof statusColors]}
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {ticket.conversationId && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onChatWithTicket?.(ticket.conversationId)}
                        data-testid={`button-chat-${ticket.id}`}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewTicket?.(ticket.id)}
                      data-testid={`button-view-${ticket.id}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
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