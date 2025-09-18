import { ConversationList } from '../conversation-list';

export default function ConversationListExample() {
  return (
    <ConversationList 
      onSelectConversation={(id) => console.log('Selected conversation:', id)} 
    />
  );
}