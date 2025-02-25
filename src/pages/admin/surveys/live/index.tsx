
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SessionDialog } from "./components/SessionDialog";
import { SessionsTable } from "./components/SessionsTable";
import { LiveSession } from "./types";

export default function LiveSurveyPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ["live-sessions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_survey_sessions")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as LiveSession[];
    },
  });

  const handleDialogClose = () => {
    setIsCreateOpen(false);
    setEditingSession(null);
  };

  const handleEdit = (session: LiveSession) => {
    setEditingSession(session);
    setIsCreateOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Live Survey</h1>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Sessions</CardTitle>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </CardHeader>
        <CardContent>
          <SessionsTable
            sessions={sessions}
            isLoading={isLoading}
            onEdit={handleEdit}
            onStatusChange={refetch}
          />
        </CardContent>
      </Card>

      <SessionDialog
        isOpen={isCreateOpen}
        onClose={handleDialogClose}
        editingSession={editingSession}
        onSuccess={refetch}
      />
    </div>
  );
}
