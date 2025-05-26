
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, Users, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { SupervisorAnalysisData } from "../hooks/useSupervisorAnalysis";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface SupervisorListProps {
  supervisors: SupervisorAnalysisData[];
  selectedSupervisorId?: string;
  onSelectSupervisor: (supervisorId: string) => void;
  isLoading: boolean;
}

export function SupervisorList({ 
  supervisors, 
  selectedSupervisorId, 
  onSelectSupervisor,
  isLoading 
}: SupervisorListProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredSupervisors = supervisors.filter(supervisor =>
    supervisor.supervisor_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search supervisors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredSupervisors.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? "No supervisors match your search" : "No supervisor analysis data available"}
          </div>
        ) : (
          filteredSupervisors.map((supervisor) => (
            <div
              key={supervisor.supervisor_id}
              className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                selectedSupervisorId === supervisor.supervisor_id
                  ? "bg-primary/10 border-primary"
                  : "hover:bg-muted/50"
              }`}
              onClick={() => onSelectSupervisor(supervisor.supervisor_id)}
            >
              <div className="space-y-2">
                <div className="font-medium text-sm">
                  {supervisor.supervisor_name}
                </div>
                
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{supervisor.team_size} team members</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{Math.round(supervisor.response_rate * 100)}% response rate</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="text-xs">
                    {new Date(supervisor.generated_at).toLocaleDateString()}
                  </Badge>
                  
                  <Badge 
                    variant={supervisor.response_rate >= 0.8 ? "default" : supervisor.response_rate >= 0.6 ? "secondary" : "destructive"}
                    className="text-xs"
                  >
                    {supervisor.response_rate >= 0.8 ? "High" : supervisor.response_rate >= 0.6 ? "Medium" : "Low"} Response
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
