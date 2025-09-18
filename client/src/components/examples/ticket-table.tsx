import { TicketTable } from '../ticket-table';

export default function TicketTableExample() {
  return (
    <TicketTable 
      onViewTicket={(id) => console.log('View ticket:', id)}
      onChatWithTicket={(id) => console.log('Chat with ticket:', id)}
    />
  );
}