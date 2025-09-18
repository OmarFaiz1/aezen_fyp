import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

interface IntegrationCardProps {
  name: string;
  description: string;
  icon: string;
  connected: boolean;
  onToggle: (enabled: boolean) => void;
  onConfigure: () => void;
}

export function IntegrationCard({ 
  name, 
  description, 
  icon, 
  connected, 
  onToggle, 
  onConfigure 
}: IntegrationCardProps) {
  const [isEnabled, setIsEnabled] = useState(connected);

  const handleToggle = (enabled: boolean) => {
    setIsEnabled(enabled);
    onToggle(enabled);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Card 
        className="h-full hover-elevate"
        data-testid={`card-integration-${name.toLowerCase().replace(/\s+/g, '-')}`}
      >
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">
                {icon}
              </div>
              <div>
                <CardTitle className="text-base">{name}</CardTitle>
                <Badge 
                  variant={isEnabled ? "default" : "secondary"}
                  className="mt-1"
                >
                  {isEnabled ? "Connected" : "Disconnected"}
                </Badge>
              </div>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={handleToggle}
              data-testid={`switch-${name.toLowerCase().replace(/\s+/g, '-')}`}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            {description}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onConfigure}
              disabled={!isEnabled}
              data-testid={`button-configure-${name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={!isEnabled}
              data-testid={`button-open-${name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}