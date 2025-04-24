
import { cn } from "@/lib/utils";
import { NpsData } from "../types/nps";
import { GaugeChart } from "@/components/ui/gauge-chart";

interface NpsChartProps {
  data: NpsData;
}

export function NpsChart({ data }: NpsChartProps) {
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
          showIcons={true}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-lg bg-destructive/10 p-4">
          <div className="font-medium text-destructive">Detractors</div>
          <div className="text-2xl font-semibold text-destructive">
            {data.detractors}
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(percentages.detractors)}%
          </div>
        </div>
        
        <div className="rounded-lg bg-yellow-500/10 p-4">
          <div className="font-medium text-yellow-600">Passives</div>
          <div className="text-2xl font-semibold text-yellow-600">
            {data.passives}
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(percentages.passives)}%
          </div>
        </div>
        
        <div className="rounded-lg bg-green-500/10 p-4">
          <div className="font-medium text-green-600">Promoters</div>
          <div className="text-2xl font-semibold text-green-600">
            {data.promoters}
          </div>
          <div className="text-sm text-muted-foreground">
            {Math.round(percentages.promoters)}%
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <div className="text-sm text-muted-foreground">Average Rating</div>
          <div className="text-2xl font-bold">
            {data.avg_score?.toFixed(1) || "N/A"}
          </div>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <div className="text-sm text-muted-foreground">Total Responses</div>
          <div className="text-2xl font-bold">{totalResponses}</div>
        </div>
      </div>
    </div>
  );
}
