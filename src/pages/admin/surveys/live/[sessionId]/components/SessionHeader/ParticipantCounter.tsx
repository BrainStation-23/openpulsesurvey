
import { useEffect, useState } from "react";
import { Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ParticipantCounterProps {
  sessionId: string;
}

export function ParticipantCounter({ sessionId }: ParticipantCounterProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initial count
    const fetchCount = async () => {
      const { count: participantCount } = await supabase
        .from("live_session_participants")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId)
        .eq("status", "connected");

      setCount(participantCount || 0);
    };

    fetchCount();

    // Subscribe to participant changes
    const channel = supabase
      .channel(`participants:${sessionId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_session_participants",
          filter: `session_id=eq.${sessionId}`,
        },
        () => {
          fetchCount(); // Refresh count on any change
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <Users className="h-4 w-4" />
      <span>{count} participants</span>
    </div>
  );
}
