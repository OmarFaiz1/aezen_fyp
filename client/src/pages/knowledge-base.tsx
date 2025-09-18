import { KnowledgeBaseForm } from "@/components/knowledge-base-form";
import { KnowledgeBaseList } from "@/components/knowledge-base-list";
import { motion } from "framer-motion";

export default function KnowledgeBase() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Knowledge Base</h1>
        <p className="text-muted-foreground">Train your AI assistant with documents, FAQs, and data sources.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KnowledgeBaseForm />
        <KnowledgeBaseList />
      </div>
    </motion.div>
  );
}