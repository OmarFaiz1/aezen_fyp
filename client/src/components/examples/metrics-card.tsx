import { MetricsCard } from '../metrics-card';
import { MessageSquare } from 'lucide-react';

export default function MetricsCardExample() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <MetricsCard
        title="Active Chats"
        value={15}
        change="+12% from last hour"
        icon={MessageSquare}
        trend="up"
      />
      <MetricsCard
        title="Response Time"
        value="1.2min"
        change="+5% from yesterday" 
        icon={MessageSquare}
        trend="down"
      />
    </div>
  );
}