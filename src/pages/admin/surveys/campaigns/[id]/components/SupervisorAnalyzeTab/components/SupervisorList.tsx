
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Search, Users, TrendingUp, CheckCircle, Clock, Mail } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SupervisorAnalysisData } from "../hooks/useSupervisorAnalysis";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SupervisorListProps {
  supervisors: SupervisorAnalysisData[];
  selectedSupervisorId?: string;
  onSelectSupervisor: (supervisorId: string) => void;
  isLoading: boolean;
  selectedForEmail: string[];
  onEmailSelectionChange: (supervisorIds: string[]) => void;
  onSendEmails: (supervisorIds: string[]) => void;
  isSendingEmails: boolean;
}

export function SupervisorList({ 
  supervisors, 
  selectedSupervisorId, 
  onSelectSupervisor,
  isLoading,
  selectedForEmail,
  onEmailSelectionChange,
  onSendEmails,
  isSendingEmails
}: SupervisorListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSupervisors = supervisors.filter(supervisor =>
    supervisor.supervisor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Only show supervisors with generated analysis for email
  const supervisorsWithAnalysis = filteredSupervisors.filter(supervisor => supervisor.has_analysis);

  const handleSelectAll = () => {
    const allIds = supervisorsWithAnalysis.map(s => s.supervisor_id);
    onEmailSelectionChange(allIds);
  };

  const handleDeselectAll = () => {
    onEmailSelectionChange([]);
  };

  const handleSingleSelect = (supervisorId: string, checked: boolean) => {
    if (checked) {
      onEmailSelectionChange([...selectedForEmail, supervisorId]);
    } else {
      onEmailSelectionChange(selectedForEmail.filter(id => id !== supervisorId));
    }
  };

  const handleSendEmails = () => {
    onSendEmails(selectedForEmail);
  };

  const handleCardClick = (supervisorId: string) => {
    onSelectSupervisor(supervisorId);
  };

  const handleCheckboxClick = (e: React.MouseEvent, supervisorId: string, checked: boolean) => {
    e.stopPropagation(); // Prevent card selection when clicking checkbox
    handleSingleSelect(supervisorId, checked);
  };

  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Supervisors
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <LoadingSpinner />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Supervisors ({filteredSupervisors.length})
        </CardTitle>
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search supervisors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {supervisorsWithAnalysis.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Email Selection ({selectedForEmail.length} selected)
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSelectAll}
                    disabled={selectedForEmail.length === supervisorsWithAnalysis.length}
                  >
                    Select All
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeselectAll}
                    disabled={selectedForEmail.length === 0}
                  >
                    Deselect All
                  </Button>
                </div>
              </div>
              
              {selectedForEmail.length > 0 && (
                <Button
                  onClick={handleSendEmails}
                  disabled={isSendingEmails}
                  className="w-full"
                  size="sm"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {isSendingEmails ? 'Sending...' : `Send Email to ${selectedForEmail.length} Supervisor${selectedForEmail.length > 1 ? 's' : ''}`}
                </Button>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredSupervisors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No supervisors match your search" : "No eligible supervisors found"}
          </div>
        ) : (
          filteredSupervisors.map((supervisor) => (
            <div
              key={supervisor.supervisor_id}
              className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                selectedSupervisorId === supervisor.supervisor_id
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => handleCardClick(supervisor.supervisor_id)}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {supervisor.has_analysis && (
                      <Checkbox
                        checked={selectedForEmail.includes(supervisor.supervisor_id)}
                        onCheckedChange={(checked) => 
                          handleCheckboxClick(
                            { stopPropagation: () => {} } as React.MouseEvent, 
                            supervisor.supervisor_id, 
                            checked as boolean
                          )
                        }
                        onClick={(e) => handleCheckboxClick(e, supervisor.supervisor_id, !selectedForEmail.includes(supervisor.supervisor_id))}
                      />
                    )}
                    <div className="font-medium text-sm">
                      {supervisor.supervisor_name}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {supervisor.status === 'generated' ? (
                      <CheckCircle className="h-3 w-3 text-green-500" />
                    ) : (
                      <Clock className="h-3 w-3 text-orange-500" />
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{supervisor.team_size} team members</span>
                  </div>
                  
                  {supervisor.has_analysis && (
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      <span>{Math.round(supervisor.response_rate)}% response rate</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    {supervisor.has_analysis 
                      ? new Date(supervisor.generated_at).toLocaleDateString()
                      : 'No analysis'
                    }
                  </Badge>
                  
                  <Badge 
                    variant={supervisor.status === 'generated' ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {supervisor.status === 'generated' ? 'Generated' : 'Pending'}
                  </Badge>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
