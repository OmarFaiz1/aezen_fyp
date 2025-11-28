import { Bot } from "lucide-react";
import { motion } from "framer-motion";
import { useRoute } from "wouter";

export default function BotDetail() {
  // match = true/false
  // params = { id: "1" }
  const [match, params] = useRoute("/bots/:id");
  if (!match) return null;

  const { id } = params;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-primary/10 rounded-lg">
          <Bot className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Bot #{id}</h1>
          <p className="text-muted-foreground">Full configuration coming soon</p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-16 text-center">
        <Bot className="h-20 w-20 text-muted-foreground mx-auto mb-4" />
        <p className="text-lg text-muted-foreground">Bot dashboard will load here</p>
      </div>
    </motion.div>
  );
}
