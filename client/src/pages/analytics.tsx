import { AnalyticsGrid } from "@/components/analytics-grid";
import { motion } from "framer-motion";

export default function Analytics() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <AnalyticsGrid />
    </motion.div>
  );
}