
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function LiveEntryPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [joinCode, setJoinCode] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a join code",
        variant: "destructive",
      });
      return;
    }

    setIsChecking(true);
    try {
      const { data: session, error: sessionError } = await supabase
        .from("live_survey_sessions")
        .select("id, status")
        .eq("join_code", joinCode.trim())
        .single();

      if (sessionError || !session) {
        throw new Error("Session not found");
      }

      if (session.status === "ended") {
        throw new Error("This session has ended");
      }

      navigate(`/live/${joinCode}/join`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Unable to join session",
        variant: "destructive",
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">Join Live Session</h1>
          <p className="text-muted-foreground mt-2">Enter the session code to join</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="text"
              placeholder="Enter session code"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              disabled={isChecking}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isChecking}
          >
            {isChecking ? "Checking..." : "Continue"}
          </Button>
        </form>
      </div>
    </div>
  );
}
