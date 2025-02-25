
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  PlayCircle, 
  PauseCircle, 
  StopCircle, 
  Copy, 
  CheckCircle 
} from "lucide-react";
import { useState } from "react";
import { LiveSession, SessionStatus } from "../../../../types";
import { JoinCodeDisplay } from "./JoinCodeDisplay";
import { ParticipantCounter } from "./ParticipantCounter";

interface SessionHeaderProps {
  session: LiveSession;
  onStatusChange: (status: SessionStatus) => Promise<void>;
}

export function SessionHeader({ session, onStatusChange }: SessionHeaderProps) {
  const [isCopied, setIsCopied] = useState(false);

  const copyJoinCode = async () => {
    await navigator.clipboard.writeText(session.join_code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-2">{session.name}</h1>
          <div className="flex items-center gap-4">
            <JoinCodeDisplay code={session.join_code} />
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={copyJoinCode}
            >
              {isCopied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {isCopied ? "Copied!" : "Copy Join Code"}
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <ParticipantCounter sessionId={session.id} />
          
          <div className="flex items-center gap-2">
            {session.status === "initial" && (
              <Button
                onClick={() => onStatusChange("active")}
                variant="default"
                className="gap-2"
              >
                <PlayCircle className="h-4 w-4" />
                Start Session
              </Button>
            )}
            
            {session.status === "active" && (
              <>
                <Button
                  onClick={() => onStatusChange("paused")}
                  variant="outline"
                  className="gap-2"
                >
                  <PauseCircle className="h-4 w-4" />
                  Pause
                </Button>
                <Button
                  onClick={() => onStatusChange("ended")}
                  variant="destructive"
                  className="gap-2"
                >
                  <StopCircle className="h-4 w-4" />
                  End
                </Button>
              </>
            )}
            
            {session.status === "paused" && (
              <>
                <Button
                  onClick={() => onStatusChange("active")}
                  variant="default"
                  className="gap-2"
                >
                  <PlayCircle className="h-4 w-4" />
                  Resume
                </Button>
                <Button
                  onClick={() => onStatusChange("ended")}
                  variant="destructive"
                  className="gap-2"
                >
                  <StopCircle className="h-4 w-4" />
                  End
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
