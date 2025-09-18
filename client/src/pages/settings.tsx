import { SettingsForm } from "@/components/settings-form";
import { motion } from "framer-motion";

export default function Settings() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-6"
    >
      <SettingsForm />
    </motion.div>
  );
}