
import { GaugeChart } from "./GaugeChart";
import { cn } from "@/lib/utils";
import { NpsData } from "../types/nps";

interface NpsChartProps {
  data: NpsData;
}

export function NpsChart({ data }: NpsChartProps) {
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
    <div className="space-y-8">
      <div className="flex flex-col items-center justify-center">
        <GaugeChart score={npsScore} size={300} />
        
        <div className="mt-4 flex items-center gap-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">eNPS Score</div>
            <div className={cn(
              "text-2xl font-bold",
              npsScore >= 30 ? "text-green-500" : 
              npsScore >= 0 ? "text-yellow-500" : 
              npsScore >= -50 ? "text-orange-500" : 
              "text-red-500"
            )}>
              {npsScore}
            </div>
          </div>
          
          {data.avg_score !== undefined && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Avg Rating</div>
              <div className="text-2xl font-bold text-gray-700">
                {data.avg_score || 'N/A'}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="space-y-2 p-4 rounded-lg bg-green-50 hover:bg-green-100 transition-colors">
          <div className="text-sm text-muted-foreground">Promoters</div>
          <div className="text-xl font-semibold text-green-600">
            {Math.round(percentages.promoters)}% ({data.promoters})
          </div>
        </div>

        <div className="space-y-2 p-4 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors">
          <div className="text-sm text-muted-foreground">Passives</div>
          <div className="text-xl font-semibold text-yellow-600">
            {Math.round(percentages.passives)}% ({data.passives})
          </div>
        </div>

        <div className="space-y-2 p-4 rounded-lg bg-red-50 hover:bg-red-100 transition-colors">
          <div className="text-sm text-muted-foreground">Detractors</div>
          <div className="text-xl font-semibold text-red-600">
            {Math.round(percentages.detractors)}% ({data.detractors})
          </div>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Total Responses: {totalResponses}
      </div>
    </div>
  );
}
