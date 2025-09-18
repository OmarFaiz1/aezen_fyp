import { BotBuilder } from "@/components/bot-builder";
import { motion } from "framer-motion";

export default function BotBuilderPage() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <BotBuilder />
    </motion.div>
  );
}