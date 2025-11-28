import { TicketTable } from "@/components/ticket-table";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { useState } from "react";
import { TicketDetailsDialog } from "@/components/ticket-details-dialog";

export default function MyTickets() {
    const [, setLocation] = useLocation();
    const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
    const [detailsOpen, setDetailsOpen] = useState(false);

    const handleViewTicket = (id: string) => {
        setSelectedTicketId(id);
        setDetailsOpen(true);
    };

    const handleChatWithTicket = (conversationId: string) => {
        setLocation(`/conversations?id=${conversationId}`);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6 p-6"
        >
            <div>
                <h1 className="text-3xl font-bold">My Tickets</h1>
                <p className="text-muted-foreground">View and manage tickets assigned to you.</p>
            </div>

            <TicketTable
                onViewTicket={handleViewTicket}
                onChatWithTicket={handleChatWithTicket}
                endpoint="/api/tickets/my"
                title="Assigned Tickets"
            />

            <TicketDetailsDialog
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                ticketId={selectedTicketId}
            />
        </motion.div>
    );
}
