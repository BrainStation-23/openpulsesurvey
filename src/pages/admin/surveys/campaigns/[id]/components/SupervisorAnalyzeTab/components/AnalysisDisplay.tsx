
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Calendar, FileText } from "lucide-react";
import { SupervisorAnalysisData } from "../hooks/useSupervisorAnalysis";
import ReactMarkdown from 'react-markdown';

interface AnalysisDisplayProps {
  supervisor?: SupervisorAnalysisData;
  isLoading: boolean;
}

export function AnalysisDisplay({ supervisor, isLoading }: AnalysisDisplayProps) {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-muted-foreground">Loading analysis...</div>
        </CardContent>
      </Card>
    );
  }

  if (!supervisor) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Analysis
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-40">
          <div className="text-muted-foreground">
            Select a supervisor from the list to view their analysis
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Analysis for {supervisor.supervisor_name}
        </CardTitle>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>{supervisor.team_size} team members</span>
          </div>
          
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4" />
            <span>{Math.round(supervisor.response_rate * 100)}% response rate</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(supervisor.generated_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div>
          <Badge 
            variant={supervisor.response_rate >= 0.8 ? "default" : supervisor.response_rate >= 0.6 ? "secondary" : "destructive"}
          >
            {supervisor.response_rate >= 0.8 ? "High" : supervisor.response_rate >= 0.6 ? "Medium" : "Low"} Response Rate
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="max-h-[400px] overflow-y-auto">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>
            {supervisor.analysis_content}
          </ReactMarkdown>
        </div>
      </CardContent>
    </Card>
  );
}
