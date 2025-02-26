
import { LiveSession } from "../../../../types";
import { Card } from "@/components/ui/card";
import { Copy, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import QRCode from "qrcode.react"; // Changed from { QRCode } to default import
import { useState, useCallback } from "react";
import { toast } from "sonner";

interface SessionInfoSlideProps {
  session: LiveSession;
  participants: number;
  isActive: boolean;
}

export function SessionInfoSlide({ session, participants, isActive }: SessionInfoSlideProps) {
  const [copied, setCopied] = useState(false);
  
  // Get the base URL from window.location in a way that works in all environments
  const baseUrl = window.location.origin;
  const joinUrl = `${baseUrl}/live/${session.join_code}`;

  const handleCopyUrl = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      toast.success("Join URL copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy URL");
    }
  }, [joinUrl]);

  return (
    <div className={`slide ${isActive ? 'active' : ''}`}>
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">{session.name}</h1>
          {session.description && (
            <p className="text-xl text-muted-foreground">{session.description}</p>
          )}
        </div>

        {/* QR Code - Primary Focus */}
        <div className="p-4 bg-white rounded-lg">
          <QRCode 
            value={joinUrl}
            size={300}
            level="H"
            includeMargin={true}
            aria-label="QR code for joining the session"
          />
        </div>

        {/* Join URL with Copy Button */}
        <Card className="p-6 w-full max-w-2xl">
          <div className="space-y-4">
            <div className="text-2xl font-semibold text-center">Join URL</div>
            <div className="flex items-center gap-2 bg-muted p-3 rounded-md">
              <input
                type="text"
                value={joinUrl}
                readOnly
                className="flex-1 bg-transparent border-none outline-none text-lg font-mono"
                aria-label="Session join URL"
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopyUrl}
                className="shrink-0"
                aria-label="Copy join URL"
              >
                <Copy className="h-5 w-5" />
              </Button>
            </div>
            <div className="text-center text-sm text-muted-foreground">
              Share this URL or scan the QR code to join the session
            </div>
          </div>
        </Card>

        {/* Participant Counter */}
        <div className="flex items-center gap-2 text-xl text-muted-foreground">
          <Users className="h-6 w-6" />
          <span>{participants} Participants</span>
        </div>
      </div>
    </div>
  );
}
