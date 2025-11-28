// src/components/integration-card.tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { getSocket } from "@/lib/socket";
import { useEffect } from "react";

export type IntegrationPlatform =
  | "whatsapp"
  | "instagram"
  | "messenger"
  | "slack"
  | "email"
  | "webchat";

export interface IntegrationCardProps {
  name: string;
  description: string;
  icon: string;
  platform: IntegrationPlatform;
}

async function parseMaybeResponse<T>(res: unknown): Promise<T> {
  if (typeof res === "object" && res !== null && "json" in (res as any) && typeof (res as any).json === "function") {
    return (await (res as Response).json()) as T;
  }
  return res as T;
}

export function IntegrationCard({ name, description, icon, platform }: IntegrationCardProps) {
  const queryClient = useQueryClient();

  const { data: status, isLoading } = useQuery<{
    connected: boolean;
    initialized: boolean;
  }, Error>({
    queryKey: [`/integrations/${platform}/status`],
    queryFn: async () => {
      const res = await apiRequest("GET", `/integrations/${platform}/status`);
      return parseMaybeResponse<{ connected: boolean; initialized: boolean }>(res);
    },
    refetchInterval: platform === "whatsapp" ? 3000 : false,
  });

  const isConnected = status?.connected === true;
  const isInitialized = status?.initialized === true;
  const isFullyReady = isConnected && isInitialized;

  useEffect(() => {
    if (status) {
      console.log('[FRONTEND] WhatsApp Status:', status, '→ Fully Ready:', isFullyReady);
    }
  }, [status, isFullyReady]);

  const toggleMutation = useMutation<void, unknown, boolean>({
    mutationFn: async (enabled: boolean): Promise<void> => {
      const res = await apiRequest("POST", `/integrations/${platform}/toggle`, { enabled });
      if (typeof res === "object" && res !== null && "ok" in (res as any)) {
        const response = res as Response;
        if (!response.ok) throw new Error("Toggle failed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/integrations/${platform}/status`] });
    },
  });

  const handleToggle = (enabled: boolean) => {
    if (!isFullyReady && enabled) return;
    toggleMutation.mutate(enabled);
  };

  useEffect(() => {
    if (platform !== "whatsapp") return;

    const socket = getSocket();
    const refresh = () => {
      console.log('SOCKET EVENT → REFRESHING STATUS');
      queryClient.invalidateQueries({ queryKey: [`/whatsapp/${platform}/status`] });
    };

    socket.on("whatsapp_connected", refresh);
    socket.on("status_change", refresh);

    return () => {
      socket.off("whatsapp_connected", refresh);
      socket.off("status_change", refresh);
    };
  }, [platform, queryClient]);

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}>
      <Card className="h-full hover-elevate">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-lg">{icon}</div>
              <div>
                <CardTitle className="text-base">{name}</CardTitle>
                <Badge variant={isFullyReady ? "default" : "secondary"} className="mt-1">
                  {isLoading
                    ? "Checking…"
                    : isFullyReady
                      ? "Connected"
                      : isConnected
                        ? "Initializing…"
                        : "Disconnected"}
                </Badge>
              </div>
            </div>
            <Switch
              checked={isFullyReady}
              onCheckedChange={handleToggle}
              disabled={!isFullyReady}
            />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">{description}</p>
          <div className="flex items-center gap-2">
            {platform === "whatsapp" ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => queryClient.setQueryData<boolean | null>(["whatsapp-qr-open"], true)}
                disabled={isFullyReady}
              >
                <Settings className="h-4 w-4 mr-2" />
                {isFullyReady ? "Connected" : "Configure"}
              </Button>
            ) : (
              <Button variant="outline" size="sm" disabled={!isFullyReady}>
                <Settings className="h-4 w-4 mr-2" />
                Configure
              </Button>
            )}
            <Button variant="ghost" size="sm" disabled={!isFullyReady}>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}