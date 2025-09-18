import { BillingDashboard } from "@/components/billing-dashboard";
import { motion } from "framer-motion";

export default function Billing() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <BillingDashboard />
    </motion.div>
  );
}