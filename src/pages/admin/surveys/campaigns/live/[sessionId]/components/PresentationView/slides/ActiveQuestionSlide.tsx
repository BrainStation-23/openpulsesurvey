
import { Card } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { LivePieChart } from "../charts/LivePieChart";
import { LiveBarChart } from "../charts/LiveBarChart";
import { LiveWordCloud } from "../charts/LiveWordCloud";
import { LiveSessionQuestion } from "../charts/types";

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
        const yesCount = processedResponses.filter(r => r === 'true' || r === true).length;
        const noCount = processedResponses.filter(r => r === 'false' || r === false).length;
        const total = yesCount + noCount;
        
        const data = [
          { value: true, count: yesCount, percentage: (yesCount / total) * 100, timestamp: Date.now() },
          { value: false, count: noCount, percentage: (noCount / total) * 100, timestamp: Date.now() }
        ];
        
        return <LivePieChart data={data} total={total} />;
      }
      
      case 'rating': {
        const validResponses = processedResponses.filter((r): r is number => 
          typeof r === 'number' && r >= 1 && r <= 5
        );
        
        const total = validResponses.length;
        const counts = Array.from({ length: 5 }, (_, i) => {
          const count = validResponses.filter(r => r === i + 1).length;
          return {
            rating: i + 1,
            count,
            percentage: (count / total) * 100,
            timestamp: Date.now()
          };
        });
        
        return <LiveBarChart data={counts} />;
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
          .reduce((acc: { text: string; value: number; percentage: number; timestamp: number }[], word) => {
            const existing = acc.find(w => w.text === word);
            if (existing) {
              existing.value++;
            } else {
              acc.push({ 
                text: word, 
                value: 1, 
                percentage: 0,
                timestamp: Date.now()
              });
            }
            return acc;
          }, [])
          .map(word => ({
            ...word,
            percentage: (word.value / processedResponses.length) * 100
          }))
          .sort((a, b) => b.value - a.value)
          .slice(0, 30);
          
        return <LiveWordCloud data={words} />;
      }
      
      default:
        return null;
    }
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
              
              <div className="mt-8 h-full flex  items-center justify-center">
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
