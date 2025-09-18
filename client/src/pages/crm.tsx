import { CustomerTable } from "@/components/customer-table";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

export default function CRM() {
  const { toast } = useToast();

  const handleViewCustomer = (id: number) => {
    // todo: remove mock functionality
    console.log("View customer:", id);
    toast({
      title: "Customer Details",
      description: `Opening customer profile for ID: ${id}`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Customer Relationship Management</h1>
        <p className="text-muted-foreground">Track customer orders, delivery status, and manage customer relationships.</p>
      </div>

      <CustomerTable onViewCustomer={handleViewCustomer} />
    </motion.div>
  );
}