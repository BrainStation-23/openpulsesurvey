
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { NpsData } from "../types/nps";
import { GaugeChart } from "@/components/ui/gauge-chart";

interface NpsChartProps {
  data: NpsData;
}

export function NpsChart({ data }: NpsChartProps) {
  // Safety check to handle empty data
  if (!data) {
    return <div className="text-center text-muted-foreground">No data available</div>;
  }

  const totalResponses = data.total;
  
  const percentages = {
    detractors: totalResponses > 0 ? (data.detractors / totalResponses) * 100 : 0,
    passives: totalResponses > 0 ? (data.passives / totalResponses) * 100 : 0,
    promoters: totalResponses > 0 ? (data.promoters / totalResponses) * 100 : 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-center">
        <GaugeChart 
          value={Math.round(data.nps_score)} 
          label="eNPS Score"
          size="lg"
        />
      </div>

      <div className="grid grid-cols-2 gap-4 items-start">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Average Rating</div>
          <div className="text-2xl font-bold">
            {data.avg_score?.toFixed(1) || "N/A"}
          </div>
        </div>
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">Total Responses</div>
          <div className="text-2xl font-bold">{totalResponses}</div>
        </div>
      </div>

      <div className="space-y-4">
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
    </div>
  );
}
