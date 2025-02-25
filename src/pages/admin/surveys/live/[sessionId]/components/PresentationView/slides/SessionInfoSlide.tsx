
import { LiveSession } from "../../../../types";
import { Card } from "@/components/ui/card";
import { Users } from "lucide-react";

interface SessionInfoSlideProps {
  session: LiveSession;
  participants: number;
  isActive: boolean;
}

export function SessionInfoSlide({ session, participants, isActive }: SessionInfoSlideProps) {
  return (
    <div className={`slide ${isActive ? 'active' : ''}`}>
      <div className="flex flex-col items-center justify-center h-full space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">{session.title}</h1>
          {session.description && (
            <p className="text-xl text-muted-foreground">{session.description}</p>
          )}
        </div>

        <Card className="p-6 w-full max-w-md">
          <div className="text-center space-y-4">
            <div className="text-2xl font-semibold">Join Code</div>
            <div className="text-4xl font-mono font-bold text-primary">
              {session.join_code}
            </div>
          </div>
        </Card>

        <div className="flex items-center gap-2 text-xl">
          <Users className="h-6 w-6" />
          <span>{participants} Participants</span>
        </div>
      </div>
    </div>
  );
}
