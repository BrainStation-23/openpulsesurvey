import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { SessionHeader } from "./components/SessionHeader";
import { QuestionManager } from "./components/QuestionManager";
import { PresentationView } from "./components/PresentationView";
import { LiveSession, SessionStatus } from "../types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronLeft, ChevronRight } from "lucide-react";
import { REALTIME_SUBSCRIBE_STATES } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";

export default function LiveSessionControlPage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sessionData, setSessionData] = useState<LiveSession | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isQuestionsCollapsed, setIsQuestionsCollapsed] = useState(false);

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

  useEffect(() => {
    if (session) {
      setSessionData(session);
    }
  }, [session]);

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
            setSessionData((current) => {
              if (!current) return payload.new as LiveSession;
              return {
                ...current,
                ...payload.new,
                survey: current.survey
              } as LiveSession;
            });
          }
        )
        .subscribe((status) => {
          console.log("Subscription status:", status);
          if (status === REALTIME_SUBSCRIBE_STATES.CHANNEL_ERROR) {
            console.error("Subscription error, retrying...");
            setTimeout(setupSubscription, 5000);
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

  const updateSessionStatus = async (newStatus: SessionStatus) => {
    if (!sessionData || isUpdating) return;

    setIsUpdating(true);
    
    const previousStatus = sessionData.status;
    setSessionData(prev => prev ? { ...prev, status: newStatus } : null);

    try {
      const { error } = await supabase
        .from("live_survey_sessions")
        .update({ status: newStatus })
        .eq("id", sessionId);

      if (error) throw error;

      refetch();

      toast({
        title: "Session status updated",
        description: `Session is now ${newStatus}`,
      });
    } catch (error) {
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
    <div className="h-screen flex flex-col overflow-hidden">
      <div className="flex-none p-6">
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
      </div>

      <div className="flex-1 min-h-0 relative">
        <div className="absolute inset-0 flex">
          <div
            className={cn(
              "h-full transition-all duration-300 ease-in-out bg-background border-r",
              isQuestionsCollapsed ? "w-[40px]" : "w-[40%]"
            )}
          >
            <Button
              variant="ghost"
              size="icon"
              className={cn(
                "absolute top-1/2 -translate-y-1/2 z-10 transition-all duration-300",
                isQuestionsCollapsed 
                  ? "-right-10 bg-background shadow-lg hover:bg-accent" 
                  : "-right-5 hover:bg-accent"
              )}
              onClick={() => setIsQuestionsCollapsed(!isQuestionsCollapsed)}
            >
              {isQuestionsCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>

            <div className={cn(
              "w-full h-full transition-opacity duration-300",
              isQuestionsCollapsed ? "opacity-0" : "opacity-100"
            )}>
              <QuestionManager
                session={currentSession}
              />
            </div>
          </div>

          <div className={cn(
            "h-full transition-all duration-300 ease-in-out",
            isQuestionsCollapsed ? "flex-1" : "flex-1"
          )}>
            <PresentationView
              session={currentSession}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
