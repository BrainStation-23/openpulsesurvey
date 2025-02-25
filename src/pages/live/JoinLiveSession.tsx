
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function JoinLiveSession() {
  const { joinCode } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [displayName, setDisplayName] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!displayName.trim()) {
      toast({
        title: "Error",
        description: "Please enter your display name",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const { data: session, error: sessionError } = await supabase
        .from("live_survey_sessions")
        .select("id, status")
        .eq("join_code", joinCode)
        .single();

      if (sessionError || !session) {
        throw new Error("Session not found or no longer active");
      }

      if (session.status !== "initial" && session.status !== "active") {
        throw new Error("This session is no longer accepting participants");
      }

      const { data: participant, error: participantError } = await supabase
        .from("live_session_participants")
        .insert({
          session_id: session.id,
          display_name: displayName.trim(),
          status: "connected",
        })
        .select()
        .single();

      if (participantError) throw participantError;

      navigate(`/live/${joinCode}`);
    } catch (error: any) {
      toast({
        title: "Error joining session",
        description: error.message || "Unable to join the session",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Join Live Session</h1>
          <p className="text-muted-foreground mt-2">Enter your name to participate</p>
        </div>

        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              disabled={isJoining}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isJoining}
          >
            {isJoining ? "Joining..." : "Join Session"}
          </Button>
        </form>
      </div>
    </div>
  );
}
