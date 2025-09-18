import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, MessageSquare, Eye } from "lucide-react";
import { motion } from "framer-motion";

// todo: remove mock functionality
const mockTickets = [
  { id: 'TK001', title: 'Order not received', priority: 'high', assignee: 'John Smith', status: 'open', createdAt: '2023-09-01' },
  { id: 'TK002', title: 'Refund request', priority: 'medium', assignee: 'Jane Doe', status: 'in-progress', createdAt: '2023-09-02' },
  { id: 'TK003', title: 'Product defect', priority: 'critical', assignee: 'Mike Johnson', status: 'open', createdAt: '2023-09-03' },
  { id: 'TK004', title: 'Billing inquiry', priority: 'low', assignee: 'Sarah Wilson', status: 'resolved', createdAt: '2023-09-04' },
];

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
  onChatWithTicket?: (id: string) => void;
}

export function TicketTable({ onViewTicket, onChatWithTicket }: TicketTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const filteredTickets = mockTickets.filter(ticket =>
    (ticket.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
     ticket.id.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === "all" || ticket.status === statusFilter) &&
    (priorityFilter === "all" || ticket.priority === priorityFilter)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card data-testid="card-ticket-table">
        <CardHeader>
          <CardTitle>Support Tickets</CardTitle>
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
            {filteredTickets.map((ticket) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 border rounded-lg hover-elevate"
                data-testid={`ticket-row-${ticket.id}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="font-mono text-sm">{ticket.id}</div>
                  <div className="flex-1">
                    <p className="font-medium">{ticket.title}</p>
                    <p className="text-sm text-muted-foreground">
                      Assigned to {ticket.assignee} • {new Date(ticket.createdAt).toLocaleDateString()}
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChatWithTicket?.(ticket.id)}
                    data-testid={`button-chat-${ticket.id}`}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
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
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}