
import { useState, useEffect } from "react";
import { QuestionCard } from "./QuestionCard";
import { useQuestionComparison } from "../hooks/useQuestionComparison";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface QuestionResponsesTabProps {
  campaignId?: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
}

export function QuestionResponsesTab({
  campaignId,
  baseInstanceId,
  comparisonInstanceId,
}: QuestionResponsesTabProps) {
  const [questionMappings, setQuestionMappings] = useState<Record<string, { title: string; type: string }>>();
  
  const { data, isLoading, error } = useQuestionComparison(
    campaignId,
    baseInstanceId,
    comparisonInstanceId
  );

  // Update question mappings from data
  useEffect(() => {
    if (data) {
      // Get distinct questions from base and comparison instances
      const questionKeys = new Set([
        ...data.baseInstance.map(q => q.question_key || ''),
        ...data.comparisonInstance.map(q => q.question_key || '')
      ]);
      
      // Create mapping of question keys to title and type
      fetch(`/api/campaigns/${campaignId}/questions`)
        .then(res => res.json())
        .then(questions => {
          const mappings: Record<string, { title: string; type: string }> = {};
          
          questionKeys.forEach(key => {
            const question = questions.find((q: any) => q.name === key);
            if (question) {
              mappings[key] = {
                title: question.title || key,
                type: question.type === 'rating' ? 'rating' : 
                      question.type === 'boolean' ? 'boolean' : 'text'
              };
            }
          });
          
          setQuestionMappings(mappings);
        })
        .catch(err => console.error("Error fetching questions:", err));
    }
  }, [data, campaignId]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Skeleton key={i} className="w-full h-[300px]" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Error loading question data: {error.message}</AlertDescription>
      </Alert>
    );
  }

  if (!data || !questionMappings) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-center text-muted-foreground">No question data available for comparison</p>
        </CardContent>
      </Card>
    );
  }

  // Filter out questions that don't have matching data in both instances
  const matchedQuestions = Object.keys(questionMappings).filter(key => {
    const baseQuestion = data.baseInstance.find(q => q.question_key === key);
    const comparisonQuestion = data.comparisonInstance.find(q => q.question_key === key);
    return baseQuestion && comparisonQuestion;
  });

  return (
    <div className="space-y-6">
      {matchedQuestions.map(questionKey => {
        const baseQuestion = data.baseInstance.find(q => q.question_key === questionKey);
        const comparisonQuestion = data.comparisonInstance.find(q => q.question_key === questionKey);
        const questionInfo = questionMappings[questionKey];

        if (!baseQuestion || !comparisonQuestion || !questionInfo) return null;

        return (
          <div key={questionKey} className="w-full">
            <QuestionCard
              baseData={baseQuestion}
              comparisonData={comparisonQuestion}
              questionTitle={questionInfo.title}
              questionType={questionInfo.type as any}
            />
          </div>
        );
      })}

      {matchedQuestions.length === 0 && (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">No matching questions found between the selected instances</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
