import { MetricsCard } from "@/components/metrics-card";
import { DashboardChart } from "@/components/dashboard-chart";
import { MessageSquare, Ticket, Clock, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

// todo: remove mock functionality
const chartData = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 22 },
  { name: 'Fri', value: 19 },
  { name: 'Sat', value: 8 },
  { name: 'Sun', value: 14 },
];

const responseTimeData = [
  { name: 'Mon', value: 2.3 },
  { name: 'Tue', value: 1.8 },
  { name: 'Wed', value: 2.1 },
  { name: 'Thu', value: 1.5 },
  { name: 'Fri', value: 2.0 },
  { name: 'Sat', value: 3.2 },
  { name: 'Sun', value: 2.8 },
];

export default function Dashboard() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back! Here's what's happening with your AI assistant.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricsCard
          title="Active Conversations"
          value={15}
          change="+12% from last hour"
          icon={MessageSquare}
          trend="up"
        />
        <MetricsCard
          title="Open Tickets"
          value={8}
          change="-2 from yesterday"
          icon={Ticket}
          trend="down"
        />
        <MetricsCard
          title="Avg Response Time"
          value="1.2min"
          change="+5% from yesterday"
          icon={Clock}
          trend="down"
        />
        <MetricsCard
          title="CSAT Score"
          value="4.8/5"
          change="+0.2 from last week"
          icon={TrendingUp}
          trend="up"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart 
          title="Conversations This Week" 
          data={chartData}
          color="hsl(var(--chart-1))"
        />
        <DashboardChart 
          title="Response Time Trends" 
          data={responseTimeData}
          color="hsl(var(--chart-2))"
        />
      </div>
    </motion.div>
  );
}