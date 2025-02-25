
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SessionDialog } from "./components/SessionDialog";
import { SessionsTable } from "./components/SessionsTable";
import { LiveSession } from "./types";
import { SessionFilters } from "./components/SessionFilters";

export default function LiveSurveyPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<LiveSession | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [showMineOnly, setShowMineOnly] = useState(false);

  const { data: sessions, isLoading, refetch } = useQuery({
    queryKey: ["live-sessions", searchQuery, selectedStatuses, showMineOnly],
    queryFn: async () => {
      const user = await supabase.auth.getUser();
      
      // Using fetch directly to call the RPC function
      const { data, error } = await supabase
        .from('live_survey_sessions')
        .select('*')
        .like('name', searchQuery ? `%${searchQuery}%` : '%')
        .in('status', selectedStatuses.length ? selectedStatuses : ['initial', 'active', 'paused', 'ended'])
        .eq(showMineOnly ? 'created_by' : 'id', showMineOnly ? user.data.user?.id : 'id')
        .order('created_at', { ascending: false });

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

  const handleStatusToggle = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status)
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
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
        <CardContent className="space-y-6">
          <SessionFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            selectedStatuses={selectedStatuses}
            onStatusChange={handleStatusToggle}
            showMineOnly={showMineOnly}
            onShowMineChange={setShowMineOnly}
          />
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
