// src/components/whatsapp-qr-dialog.tsx
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, QrCode, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket } from "@/lib/socket";
import { apiRequest } from "@/lib/api";

interface WhatsAppQRDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WhatsAppQRDialog({ open, onOpenChange }: WhatsAppQRDialogProps) {
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!open) {
      console.log("QR Dialog → CLOSED");
      setQrImage(null);
      setIsConnected(false);
      return;
    }

    console.log("QR Dialog → OPENED");
    const socket = getSocket();

    // Re-join tenant room
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user?.tenantId) {
          console.log("QR Dialog → Re-joining tenant room:", user.tenantId);
          socket.emit("joinRoom", { tenantId: user.tenantId });
        }
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
      }
    }

    // HANDLERS
    // Make the handler async so we can generate a dataUri if needed
    const handleNewQR = async (data: any) => {
      try {
        // If backend already sent a dataUri, use it immediately (preferred)
        if (typeof data === "object" && data?.dataUri) {
          console.log("QR CODE RECEIVED (dataUri) → Displaying on screen");
          setQrImage(data.dataUri);
          setIsConnected(false);
          return;
        }

        // If backend sent raw qr string or the event payload is a plain string
        const rawQr = typeof data === "string" ? data : data?.qr;
        if (rawQr) {
          console.log("QR CODE RECEIVED (raw text) → generating dataUri in browser");
          // dynamic import so you don't need to add static import at top
          const qrcode = await import("qrcode");
          const dataUri = await qrcode.toDataURL(rawQr);
          setQrImage(dataUri);
          setIsConnected(false);
          return;
        }

        // nothing usable
        console.warn("QR event delivered but had no usable qr/dataUri:", data);
      } catch (err) {
        console.error("Failed to handle QR event", err);
      }
    };

    const handleConnected = () => {
      console.log("WHATSAPP CONNECTED SUCCESSFULLY!");
      setIsConnected(true);
      queryClient.invalidateQueries({ queryKey: ["/integrations/whatsapp/status"] });
      setTimeout(() => onOpenChange(false), 2000);
    };

    // LISTEN TO ALL POSSIBLE EVENTS (ONE OF THESE WILL FIRE)
    socket.on("qr", handleNewQR);
    socket.on("whatsapp_qr", handleNewQR);           // THIS IS THE ONE YOUR BACKEND USES
    socket.on("whatsapp_connected", handleConnected);
    socket.on("ready", handleConnected);
    socket.on("connected", handleConnected);

    // Trigger QR generation
    console.log("Triggering QR generation...");
    apiRequest("POST", "/integrations/whatsapp/toggle", { enabled: true })
      .then(() => console.log("QR generation request sent"))
      .catch((err) => console.error("Failed to trigger QR:", err));

    // Cleanup
    return () => {
      socket.off("qr", handleNewQR);
      socket.off("whatsapp_qr", handleNewQR);
      socket.off("whatsapp_connected", handleConnected);
      socket.off("ready", handleConnected);
      socket.off("connected", handleConnected);
    };
  }, [open, onOpenChange, queryClient]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="h-5 w-5" />
            Connect WhatsApp Business
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-8 py-10">
          {isConnected ? (
            <>
              <CheckCircle2 className="h-20 w-20 text-green-500 animate-pulse" />
              <div className="text-center space-y-2">
                <p className="text-2xl font-bold text-green-600">Connected Successfully!</p>
                <p className="text-muted-foreground">You are now live on WhatsApp</p>
              </div>
            </>
          ) : qrImage ? (
            <>
              <div className="relative">
                <img
                  src={qrImage}
                  alt="Scan this QR code with WhatsApp"
                  className="w-64 h-64 rounded-xl border-4 border-gray-200 shadow-2xl"
                />
                <div className="absolute top-2 right-2 bg-green-500 text-white text-xs px-3 py-1 rounded-full animate-pulse">
                  LIVE
                </div>
              </div>
              <div className="text-center space-y-3">
                <p className="font-semibold">Scan with WhatsApp App</p>
                <p className="text-sm text-muted-foreground">
                  Open WhatsApp → Settings → Linked Devices → Link a Device
                </p>
                <p className="text-xs text-blue-600 font-medium animate-pulse">
                  QR refreshes automatically
                </p>
              </div>
            </>
          ) : (
            <>
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <p className="text-lg font-medium">Generating QR Code...</p>
              <p className="text-sm text-muted-foreground">Please wait a few seconds</p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}