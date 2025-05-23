
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SessionHeader } from "./components/SessionHeader";
import { QuestionManager } from "./components/QuestionManager";
import { PresentationView } from "./components/PresentationView";
import { LiveSession, SessionStatus, Survey, ThemeSettings } from "../types";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";

export default function LiveSessionControlPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<LiveSession | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Fetch session data
  const { data: session, isLoading, refetch } = useQuery({
    queryKey: ["live-session", sessionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_survey_sessions")
        .select(`
          *,
          survey:surveys(*)
        `)
        .eq("id", sessionId)
        .single();

      if (error) throw error;

      // Transform the data to match our LiveSession type
      const transformedData: LiveSession = {
        ...data,
        survey: data.survey ? {
          ...data.survey,
          json_data: data.survey.json_data as Record<string, any>,
          theme_settings: data.survey.theme_settings as unknown as ThemeSettings
        } : undefined
      };

      return transformedData;
    },
  });

  // Update local state when query data changes
  useEffect(() => {
    if (session) {
      setSessionData(session);
    }
  }, [session]);

  // Set up real-time subscription with error handling and reconnection
  useEffect(() => {
    if (!sessionId) return;

    const setupSubscription = () => {
      const channel = supabase
        .channel(`session:${sessionId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "live_survey_sessions",
            filter: `id=eq.${sessionId}`,
          },
          (payload) => {
            console.log("Received real-time update:", payload);
            // Merge new data with existing data to preserve all fields
            setSessionData((current) => {
              if (!current) return payload.new as LiveSession;
              return {
                ...current,
                ...payload.new,
                survey: current.survey // Preserve survey data since it's not included in real-time updates
              } as LiveSession;
            });
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
          if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
            console.error("Subscription error, retrying...");
            setTimeout(setupSubscription, 5000); // Retry after 5 seconds
          }
        });

      return channel;
    };

    const channel = setupSubscription();

    return () => {
      console.log("Cleaning up subscription");
      supabase.removeChannel(channel);
    };
  }, [sessionId]);

  // Update session status with optimistic updates
  const updateSessionStatus = async (newStatus: SessionStatus) => {
    if (!sessionData || isUpdating) return;

    setIsUpdating(true);
    
    // Optimistically update local state
    const previousStatus = sessionData.status;
    setSessionData(prev => prev ? { ...prev, status: newStatus } : null);

    try {
      const { error } = await supabase
        .from("live_survey_sessions")
        .update({ status: newStatus })
        .eq("id", sessionId);

      if (error) throw error;

      // Refetch to ensure we have latest data
      refetch();

      toast({
        title: "Session status updated",
        description: `Session is now ${newStatus}`,
      });
    } catch (error) {
      // Revert optimistic update on error
      setSessionData(prev => prev ? { ...prev, status: previousStatus } : null);
      
      console.error("Error updating session:", error);
      toast({
        title: "Error updating session",
        description: "Failed to update session status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-muted-foreground">Loading session...</div>
        </div>
      </div>
    );
  }

  if (!session && !sessionData) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-destructive">Session not found</div>
        </div>
      </div>
    );
  }

  const currentSession = sessionData || session;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/admin/surveys/live")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">Live Session Control</h1>
      </div>

      <SessionHeader 
        session={currentSession}
        onStatusChange={updateSessionStatus}
        isUpdating={isUpdating}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <QuestionManager
          session={currentSession}
        />
        <PresentationView
          session={currentSession}
        />
      </div>
    </div>
  );
}
