
import { LivePieChart } from "../../../charts/LivePieChart";
import { LiveBarChart } from "../../../charts/LiveBarChart";
import { LiveWordCloud } from "../../../charts/LiveWordCloud";
import { LiveSessionQuestion } from "../../../charts/types";

interface ResponseVisualizationProps {
  question: LiveSessionQuestion;
  responses: any[];
}

export function ResponseVisualization({ question, responses }: ResponseVisualizationProps) {
  if (!responses.length) {
    return (
      <div className="text-center text-muted-foreground">
        Waiting for responses...
      </div>
    );
  }

  const processedResponses = responses.map(r => {
    const response = r.response_data.response;
    if (typeof response === 'string' && !isNaN(Number(response))) {
      return Number(response);
    }
    return response;
  });

  switch (question.question_data.type) {
    case 'boolean': {
      const yesCount = processedResponses.filter(r => r === 'true' || r === true).length;
      const noCount = processedResponses.filter(r => r === 'false' || r === false).length;
      const total = yesCount + noCount;
      
      const data = [
        { value: true, count: yesCount, percentage: total > 0 ? (yesCount / total) * 100 : 0, timestamp: Date.now() },
        { value: false, count: noCount, percentage: total > 0 ? (noCount / total) * 100 : 0, timestamp: Date.now() }
      ];
      
      return (
        <div className="w-full max-w-4xl mx-auto">
          <LivePieChart data={data} total={total} />
          <div className="text-center text-muted-foreground mt-4">
            {responses.length} responses received
          </div>
        </div>
      );
    }
    
    case 'rating': {
      const validResponses = processedResponses.filter((r): r is number => 
        (typeof r === 'number' || (typeof r === 'string' && !isNaN(Number(r)))) &&
        Number(r) >= 1 && Number(r) <= 5
      ).map(r => Number(r));
      
      const total = validResponses.length;
      const counts = Array.from({ length: 5 }, (_, i) => {
        const rating = i + 1;
        const count = validResponses.filter(r => r === rating).length;
        return {
          rating,
          count,
          percentage: total > 0 ? (count / total) * 100 : 0,
          timestamp: Date.now()
        };
      });
      
      return (
        <div className="w-full max-w-4xl mx-auto">
          <LiveBarChart data={counts} />
          <div className="text-center text-muted-foreground mt-4">
            {responses.length} responses received
          </div>
        </div>
      );
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
        
      return (
        <div className="w-full max-w-4xl mx-auto">
          <LiveWordCloud data={words} />
          <div className="text-center text-muted-foreground mt-4">
            {responses.length} responses received
          </div>
        </div>
      );
    }
    
    default:
      return null;
  }
}
