import { TeamGrid } from "@/components/team-grid";
import { motion } from "framer-motion";

export default function TeamManagement() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Team Management</h1>
        <p className="text-muted-foreground">Manage team members, roles, and permissions for your AEZEN platform.</p>
      </div>

      <TeamGrid />
    </motion.div>
  );
}