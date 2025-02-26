
import { Users, CheckCircle2, Circle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { LobbyParticipant } from "../hooks/useLiveSession";

interface LobbyProps {
  participants: LobbyParticipant[];
  questionResponses: any[];
  activeQuestionKey?: string;
}

export function Lobby({ participants, questionResponses, activeQuestionKey }: LobbyProps) {
  const hasParticipantResponded = (participantId: string) => {
    if (!activeQuestionKey) return false;
    return questionResponses.some(
      response => response.participant_id === participantId
    );
  };

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
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500" />
                  <span>{participant.display_name}</span>
                </div>
                {activeQuestionKey && (
                  <div className="flex items-center gap-1 text-sm">
                    {hasParticipantResponded(participant.participant_id) ? (
                      <div className="flex items-center text-green-500">
                        <CheckCircle2 className="h-4 w-4 mr-1" />
                        <span>Answered</span>
                      </div>
                    ) : (
                      <div className="flex items-center text-muted-foreground">
                        <Circle className="h-4 w-4 mr-1" />
                        <span>Pending</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {i < participants.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
