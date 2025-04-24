import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { NpsData } from "../types/nps";

interface NpsChartProps {
  data: NpsData;
}

export function NpsChart({ data }: NpsChartProps) {
  const getScoreColor = (score: number) => {
    return score >= 8 ? 'text-green-500' : 'text-red-500';
  };

  // Safety check to handle empty data
  if (!data) {
    return <div className="text-center text-muted-foreground">No data available</div>;
  }

  const npsScore = Math.round(data.nps_score);
  const totalResponses = data.total;
  
  const percentages = {
    detractors: totalResponses > 0 ? (data.detractors / totalResponses) * 100 : 0,
    passives: totalResponses > 0 ? (data.passives / totalResponses) * 100 : 0,
    promoters: totalResponses > 0 ? (data.promoters / totalResponses) * 100 : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">eNPS Score</div>
            <div className={cn("text-2xl font-bold", getScoreColor(npsScore))}>
              {npsScore}
            </div>
          </div>
          
          {data.avg_score !== undefined && data.avg_score !== 0 && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Avg Rating</div>
              <div className="text-2xl font-bold text-gray-700">
                {data.avg_score}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Segments */}
      <div className="space-y-4">
        {/* Promoters */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Promoters</span>
            <span className="font-medium">
              {Math.round(percentages.promoters)}% ({data.promoters})
            </span>
          </div>
          <Progress 
            value={percentages.promoters} 
            className="bg-gray-100 h-2"
            indicatorClassName="bg-[#22c55e]"
          />
        </div>

        {/* Passives */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Passives</span>
            <span className="font-medium">
              {Math.round(percentages.passives)}% ({data.passives})
            </span>
          </div>
          <Progress 
            value={percentages.passives} 
            className="bg-gray-100 h-2"
            indicatorClassName="bg-[#eab308]"
          />
        </div>

        {/* Detractors */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Detractors</span>
            <span className="font-medium">
              {Math.round(percentages.detractors)}% ({data.detractors})
            </span>
          </div>
          <Progress 
            value={percentages.detractors} 
            className="bg-gray-100 h-2"
            indicatorClassName="bg-[#ef4444]"
          />
        </div>
      </div>

      {/* Total Responses */}
      <div className="text-center text-sm text-muted-foreground">
        Total Responses: {totalResponses}
      </div>
    </div>
  );
}
