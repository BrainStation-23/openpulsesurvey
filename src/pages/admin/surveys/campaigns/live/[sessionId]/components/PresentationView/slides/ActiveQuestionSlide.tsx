
import { LiveSessionQuestion } from "../../../../types";
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { BooleanCharts } from "../../../ReportsTab/charts/BooleanCharts";
import { WordCloud } from "../../../ReportsTab/charts/WordCloud";
import { NpsChart } from "../../../ReportsTab/charts/NpsChart";
import { SatisfactionDonutChart } from "../../../ReportsTab/charts/SatisfactionDonutChart";

interface ActiveQuestionSlideProps {
  currentActiveQuestion: LiveSessionQuestion | null;
  responses: any[];
  isActive: boolean;
}

export function ActiveQuestionSlide({ currentActiveQuestion, responses, isActive }: ActiveQuestionSlideProps) {
  const renderResponseVisualization = () => {
    if (!currentActiveQuestion || !responses.length) return null;

    const processedResponses = responses.map(r => r.response_data.response);
    
    switch (currentActiveQuestion.question_data.type) {
      case 'boolean': {
        const data = {
          yes: processedResponses.filter(r => r === 'true' || r === true).length,
          no: processedResponses.filter(r => r === 'false' || r === false).length
        };
        return <BooleanCharts data={data} />;
      }
      
      case 'text':
      case 'comment': {
        const words = processedResponses
          .filter((text): text is string => typeof text === 'string')
          .flatMap(text => 
            text.toLowerCase()
              .replace(/[^\w\s]/g, '')
              .split(/\s+/)
              .filter(word => word.length > 2)
          )
          .reduce((acc: { text: string; value: number; }[], word) => {
            const existing = acc.find(w => w.text === word);
            if (existing) {
              existing.value++;
            } else {
              acc.push({ text: word, value: 1 });
            }
            return acc;
          }, [])
          .sort((a, b) => b.value - a.value)
          .slice(0, 50);
          
        return <WordCloud words={words} />;
      }
      
      case 'rating': {
        const isNps = currentActiveQuestion.question_data.rateMax === 10;
        if (isNps) {
          const ratingCounts = Array(11).fill(0);
          processedResponses.forEach(rating => {
            if (typeof rating === 'number' && rating >= 0 && rating <= 10) {
              ratingCounts[rating]++;
            }
          });
          const data = ratingCounts.map((count, rating) => ({ rating, count }));
          return <NpsChart data={data} />;
        } else {
          const validResponses = processedResponses
            .filter((r): r is number => typeof r === 'number' && r >= 1 && r <= 5);
          
          const data = {
            unsatisfied: validResponses.filter(r => r <= 2).length,
            neutral: validResponses.filter(r => r === 3).length,
            satisfied: validResponses.filter(r => r >= 4).length,
            total: validResponses.length,
            median: calculateMedian(validResponses)
          };
          return <SatisfactionDonutChart data={data} />;
        }
      }
      
      default:
        return null;
    }
  };

  const calculateMedian = (ratings: number[]) => {
    if (ratings.length === 0) return 0;
    const sorted = [...ratings].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  };

  return (
    <div className={`slide ${isActive ? 'active' : ''}`}>
      {currentActiveQuestion ? (
        <div className="flex flex-col h-full">
          <Card className="p-6 flex-1">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold">
                {currentActiveQuestion.question_data.title}
              </h2>
              {typeof currentActiveQuestion.question_data.description === 'string' && (
                <p className="text-muted-foreground">
                  {currentActiveQuestion.question_data.description}
                </p>
              )}
              
              <div className="mt-8">
                {responses.length > 0 ? (
                  <div className="w-full max-w-4xl mx-auto">
                    {renderResponseVisualization()}
                    <div className="text-center text-muted-foreground mt-4">
                      {responses.length} responses received
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground">
                    Waiting for responses...
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <Alert className="max-w-lg">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>No Active Question</AlertTitle>
            <AlertDescription>
              Enable a question from the Question Manager to start collecting responses.
            </AlertDescription>
          </Alert>
        </div>
      )}
    </div>
  );
}
