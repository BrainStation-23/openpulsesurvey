
import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LobbyParticipant } from "../hooks/useLiveSession";

interface LobbyProps {
  participants: LobbyParticipant[];
}

export function Lobby({ participants }: LobbyProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5" />
        <h3 className="font-semibold">Participants ({participants.length})</h3>
      </div>
      <ScrollArea className="h-[200px] w-full">
        <div className="space-y-2">
          {participants.map((participant, i) => (
            <div key={participant.participant_id}>
              <div className="flex items-center gap-2 py-2">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                <span>{participant.display_name}</span>
              </div>
              {i < participants.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
