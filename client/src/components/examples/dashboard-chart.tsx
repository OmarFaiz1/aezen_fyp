import { DashboardChart } from '../dashboard-chart';

const mockData = [
  { name: 'Mon', value: 12 },
  { name: 'Tue', value: 18 },
  { name: 'Wed', value: 15 },
  { name: 'Thu', value: 22 },
  { name: 'Fri', value: 19 },
  { name: 'Sat', value: 8 },
  { name: 'Sun', value: 14 },
];

export default function DashboardChartExample() {
  return <DashboardChart title="Weekly Conversations" data={mockData} />;
}