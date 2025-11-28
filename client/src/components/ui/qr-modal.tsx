import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useState, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useToast } from '@/hooks/use-toast';
import { useIntegration } from '@/contexts/IntegrationContext';
import { Loader2 } from 'lucide-react';

interface QRModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRModal({ open, onOpenChange }: QRModalProps) {
  const { socket } = useIntegration();
  const { toast } = useToast();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!socket) {
      console.error('[QRModal] Socket not available');
      setError('Socket connection not available');
      setIsLoading(false);
      return;
    }

    console.log('[QRModal] Setting up socket listeners...');
    socket.on('whatsapp:qr', (qr: string) => {
      console.log('[QRModal] Received QR code:', qr);
      setQrCode(qr);
      setIsLoading(false);
      setError(null);
      console.log('[QRModal] QR code rendered, size: 400px, level: H');
    });

    socket.on('whatsapp:ready', () => {
      console.log('[QRModal] WhatsApp connected successfully');
      toast({
        title: 'Success',
        description: 'WhatsApp connected successfully!',
      });
      setQrCode(null);
      setIsLoading(false);
      setError(null);
      onOpenChange(false);
    });

    socket.on('whatsapp:status', (status: { connected: boolean; error?: string }) => {
      if (status.error) {
        console.error('[QRModal] WhatsApp connection error:', status.error);
        setError('Failed to connect WhatsApp: ' + status.error);
        setQrCode(null);
        setIsLoading(false);
        toast({
          title: 'Error',
          description: 'Failed to connect WhatsApp: ' + status.error,
          variant: 'destructive',
        });
        onOpenChange(false);
      }
    });

    return () => {
      console.log('[QRModal] Cleaning up socket listeners...');
      socket.off('whatsapp:qr');
      socket.off('whatsapp:ready');
      socket.off('whatsapp:status');
    };
  }, [socket, toast, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Connect WhatsApp</DialogTitle>
          <DialogDescription className="text-base text-muted-foreground">
            Scan the QR code below with your WhatsApp mobile app to link your account.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
              <p className="text-base text-muted-foreground">Generating QR code...</p>
            </div>
          ) : error ? (
            <p className="text-base text-destructive">{error}</p>
          ) : qrCode ? (
            <>
              <div className="p-6 bg-white rounded-xl shadow-lg border border-gray-200">
                <QRCodeCanvas
                  value={qrCode}
                  size={400} // Increased for better scannability
                  level="H" // High error correction for reliability
                  includeMargin={true} // Standard QR padding
                  fgColor="#000000" // Black foreground
                  bgColor="#FFFFFF" // White background
                  imageSettings={{
                    src: '',
                    height: 0,
                    width: 0,
                    excavate: false // No logo to ensure scannability
                  }}
                />
              </div>
              <p className="text-sm text-muted-foreground text-center max-w-md">
                Open WhatsApp on your phone, go to Settings &gt; Linked Devices &gt; Link a Device, and scan this QR code.
              </p>
            </>
          ) : (
            <p className="text-base text-muted-foreground">Waiting for QR code...</p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}