import { ChatView } from '../chat-view';

export default function ChatViewExample() {
  return (
    <ChatView 
      conversationId={1}
      customerName="John Doe"
      channel="WhatsApp"
    />
  );
}