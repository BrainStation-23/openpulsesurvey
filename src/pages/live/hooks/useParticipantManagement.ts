
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { ParticipantInfo } from "../types";
import { LobbyParticipant } from "./useLiveSession";

export function useParticipantManagement(joinCode: string, sessionId: string | null) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [participantInfo, setParticipantInfo] = useState<ParticipantInfo | null>(null);
  const [participants, setParticipants] = useState<LobbyParticipant[]>([]);

  useEffect(() => {
    const storedInfo = localStorage.getItem(`live_session_${joinCode}`);
    if (!storedInfo) {
      navigate(`/live/${joinCode}/join`);
      return;
    }
    setParticipantInfo(JSON.parse(storedInfo));
  }, [joinCode, navigate]);

  useEffect(() => {
    if (!sessionId || !participantInfo) return;

    const channel = supabase.channel(`presence_${sessionId}`)
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState() as Record<string, LobbyParticipant[]>;
        const allParticipants = Object.values(state).flat();
        setParticipants(allParticipants);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        toast({
          description: `${newPresences[0].display_name} joined the session`,
        });
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          await channel.track({
            participant_id: participantInfo.participantId,
            display_name: participantInfo.displayName,
            joined_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId, participantInfo, toast]);

  return { participantInfo, participants };
}
