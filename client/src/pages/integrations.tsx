import { IntegrationCard } from "@/components/integration-card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const integrations = [
  {
    name: "WhatsApp",
    description: "Connect WhatsApp Business API for customer messaging",
    icon: "📱",
    connected: true
  },
  {
    name: "Instagram",
    description: "Integrate Instagram Direct Messages",
    icon: "📷",
    connected: false
  },
  {
    name: "Messenger",
    description: "Connect Facebook Messenger for customer support",
    icon: "💬",
    connected: true
  },
  {
    name: "Slack",
    description: "Internal team communication and notifications",
    icon: "💼",
    connected: false
  },
  {
    name: "Email",
    description: "Handle email inquiries and support tickets",
    icon: "📧",
    connected: true
  },
  {
    name: "Web Chat",
    description: "Embed chat widget on your website",
    icon: "🌐",
    connected: true
  }
];

export default function Integrations() {
  const { toast } = useToast();

  const handleToggle = (name: string, enabled: boolean) => {
    // todo: remove mock functionality
    console.log(`${name} ${enabled ? 'enabled' : 'disabled'}`);
    toast({
      title: enabled ? "Integration Enabled" : "Integration Disabled",
      description: `${name} has been ${enabled ? 'connected' : 'disconnected'}.`,
    });
  };

  const handleConfigure = (name: string) => {
    // todo: remove mock functionality
    console.log(`Configure ${name}`);
    toast({
      title: "Configuration",
      description: `${name} configuration panel would open here.`,
    });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6 p-6"
    >
      <div>
        <h1 className="text-3xl font-bold">Integrations</h1>
        <p className="text-muted-foreground">Connect your favorite platforms and channels for omnichannel support.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {integrations.map((integration, index) => (
          <motion.div
            key={integration.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <IntegrationCard
              name={integration.name}
              description={integration.description}
              icon={integration.icon}
              connected={integration.connected}
              onToggle={(enabled) => handleToggle(integration.name, enabled)}
              onConfigure={() => handleConfigure(integration.name)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}