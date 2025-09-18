import { TicketTable } from "@/components/ticket-table";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function Ticketing() {
  const { toast } = useToast();

  const handleViewTicket = (id: string) => {
    // todo: remove mock functionality
    console.log("View ticket:", id);
    toast({
      title: "Ticket Details",
      description: `Opening details for ticket ${id}`,
    });
  };

  const handleChatWithTicket = (id: string) => {
    // todo: remove mock functionality
    console.log("Chat with ticket:", id);
    toast({
      title: "Ticket Chat",
      description: `Opening chat view for ticket ${id}`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Support Ticketing</h1>
        <p className="text-muted-foreground">Manage support tickets with priority-based workflow and team assignment.</p>
      </div>

      <TicketTable 
        onViewTicket={handleViewTicket}
        onChatWithTicket={handleChatWithTicket}
      />
    </motion.div>
  );
}