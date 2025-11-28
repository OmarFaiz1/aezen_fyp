// src/pages/integrations.tsx
import { IntegrationCard, IntegrationCardProps } from "@/components/integration-card";
import { WhatsAppQRDialog } from "@/components/whatsapp-qr-dialog";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";

const integrations: IntegrationCardProps[] = [
  { name: "WhatsApp", description: "Connect WhatsApp Business for messaging", icon: "Phone", platform: "whatsapp" },
  { name: "Instagram", description: "Integrate Instagram Direct Messages", icon: "Camera", platform: "instagram" },
  { name: "Messenger", description: "Connect Facebook Messenger", icon: "Message Circle", platform: "messenger" },
  { name: "Slack", description: "Internal team communication", icon: "Slack Logo", platform: "slack" },
  { name: "Email", description: "Handle email inquiries", icon: "Mail", platform: "email" },
  { name: "Web Chat", description: "Embed chat widget on website", icon: "Globe", platform: "webchat" },
];

export default function Integrations() {
  const queryClient = useQueryClient();
  const [qrOpen, setQrOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
      if (event?.query?.queryKey?.[0] === "whatsapp-qr-open") {
        setQrOpen(true);

        // Prevent infinite loop by only clearing if value is not null
        const currentValue = queryClient.getQueryData<boolean | null>(["whatsapp-qr-open"]);
        if (currentValue !== null) {
          setTimeout(() => {
            queryClient.setQueryData<boolean | null>(["whatsapp-qr-open"], null);
          });
        }
      }
    });
    return () => unsubscribe();
  }, [queryClient]);

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold">Integrations</h1>
          <p className="text-muted-foreground">Connect your favorite platforms and channels.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map((int, i) => (
            <motion.div
              key={int.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.1 }}
            >
              <IntegrationCard {...int} />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <WhatsAppQRDialog open={qrOpen} onOpenChange={setQrOpen} />
    </>
  );
}
