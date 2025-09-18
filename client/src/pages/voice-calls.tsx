import { VoiceCallsList } from "@/components/voice-calls-list";
import { motion } from "framer-motion";

export default function VoiceCalls() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Voice Calls Monitoring</h1>
        <p className="text-muted-foreground">Monitor voice calls with real-time sentiment analysis and human takeover capabilities.</p>
      </div>

      <VoiceCallsList />
    </motion.div>
  );
}