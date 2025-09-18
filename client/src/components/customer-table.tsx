import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, User } from "lucide-react";
import { motion } from "framer-motion";

// todo: remove mock functionality
const mockCustomers = [
  { id: 1, name: 'Alice Smith', orderId: 'ORD123', status: 'Confirmed', deliveryDate: '2023-09-20', phone: '+1234567890', email: 'alice@example.com' },
  { id: 2, name: 'Bob Johnson', orderId: 'ORD456', status: 'Pending', deliveryDate: '2023-09-25', phone: '+0987654321', email: 'bob@example.com' },
  { id: 3, name: 'Carol Williams', orderId: 'ORD789', status: 'Shipped', deliveryDate: '2023-09-18', phone: '+1122334455', email: 'carol@example.com' },
  { id: 4, name: 'David Brown', orderId: 'ORD321', status: 'Delivered', deliveryDate: '2023-09-15', phone: '+5566778899', email: 'david@example.com' },
];

const statusColors = {
  Confirmed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Shipped: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Delivered: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

interface CustomerTableProps {
  onViewCustomer?: (id: number) => void;
}

export function CustomerTable({ onViewCustomer }: CustomerTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState("");

  const filteredCustomers = mockCustomers.filter(customer =>
    (customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     customer.orderId.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === "" || customer.status === statusFilter)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card data-testid="card-customer-table">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Customer Management
          </CardTitle>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-customers"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32" data-testid="select-status-filter">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All</SelectItem>
                <SelectItem value="Confirmed">Confirmed</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Shipped">Shipped</SelectItem>
                <SelectItem value="Delivered">Delivered</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40" data-testid="select-date-range">
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Time</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredCustomers.map((customer) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-between p-3 border rounded-lg hover-elevate cursor-pointer"
                onClick={() => onViewCustomer?.(customer.id)}
                data-testid={`customer-row-${customer.id}`}
              >
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{customer.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Order {customer.orderId} • {customer.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">Delivery: {new Date(customer.deliveryDate).toLocaleDateString()}</p>
                    <p className="text-xs text-muted-foreground">{customer.phone}</p>
                  </div>
                  <Badge 
                    variant="secondary"
                    className={statusColors[customer.status as keyof typeof statusColors]}
                  >
                    {customer.status}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewCustomer?.(customer.id);
                  }}
                  data-testid={`button-view-customer-${customer.id}`}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}