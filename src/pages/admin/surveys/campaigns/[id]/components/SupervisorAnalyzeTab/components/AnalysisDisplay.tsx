
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, TrendingUp, Calendar, FileText, Clock, CheckCircle } from "lucide-react";
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
          
          {supervisor.has_analysis && (
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              <span>{Math.round(supervisor.response_rate)}% response rate</span>
            </div>
          )}
          
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{new Date(supervisor.generated_at).toLocaleDateString()}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge 
            variant={supervisor.status === 'generated' ? "default" : "secondary"}
            className="flex items-center gap-1"
          >
            {supervisor.status === 'generated' ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            {supervisor.status === 'generated' ? 'Analysis Generated' : 'Analysis Pending'}
          </Badge>
          
          {supervisor.has_analysis && (
            <Badge 
              variant={supervisor.response_rate >= 80 ? "default" : supervisor.response_rate >= 60 ? "secondary" : "destructive"}
            >
              {supervisor.response_rate >= 80 ? "High" : supervisor.response_rate >= 60 ? "Medium" : "Low"} Response Rate
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="max-h-[400px] overflow-y-auto">
        <div className="prose prose-sm max-w-none dark:prose-invert">
          <ReactMarkdown>
            {supervisor.analysis_content}
          </ReactMarkdown>
        </div>
        
        {!supervisor.has_analysis && (
          <div className="mt-4 p-4 rounded-lg bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800">
            <div className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Analysis Not Generated</span>
            </div>
            <p className="text-sm text-orange-600 dark:text-orange-400 mt-1">
              This supervisor is eligible for analysis but hasn't been generated yet. Use the "Generate AI Feedback" button to create the analysis.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
