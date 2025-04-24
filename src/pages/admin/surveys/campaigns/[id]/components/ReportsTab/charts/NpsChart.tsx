
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
    detractors: totalResponses > 0 ? Math.round((data.detractors / totalResponses) * 100) : 0,
    passives: totalResponses > 0 ? Math.round((data.passives / totalResponses) * 100) : 0,
    promoters: totalResponses > 0 ? Math.round((data.promoters / totalResponses) * 100) : 0,
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">
          On a scale of 1-10, how likely are you to recommend our service to a friend?
        </h2>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex-1">
          <GaugeChart 
            value={Math.round(data.nps_score)} 
            label="eNPS Score"
            size="lg"
            showIcons={true}
          />
        </div>
        <div className="flex-1 text-right">
          <div className="text-5xl font-bold text-primary">
            {Math.round(data.nps_score)}%
          </div>
          <div className="text-xl text-muted-foreground mt-2">
            Net Promoter Score
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center">NPS Report Breakdown</h3>
        
        <div className="flex gap-2 h-4 rounded-full overflow-hidden">
          <div 
            className="bg-destructive" 
            style={{ width: `${percentages.detractors}%` }} 
          />
          <div 
            className="bg-yellow-500" 
            style={{ width: `${percentages.passives}%` }} 
          />
          <div 
            className="bg-green-500" 
            style={{ width: `${percentages.promoters}%` }} 
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-destructive" />
              <span>Detractors (0-6)</span>
              <span className="ml-auto font-semibold">{percentages.detractors}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-yellow-500" />
              <span>Passives (7-8)</span>
              <span className="ml-auto font-semibold">{percentages.passives}%</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              <span>Promoters (9-10)</span>
              <span className="ml-auto font-semibold">{percentages.promoters}%</span>
            </div>
          </div>
          
          <div className="space-y-2 border-l pl-4">
            <div className="text-sm text-muted-foreground">
              <span>Average Rating</span>
              <div className="text-2xl font-semibold text-foreground">
                {data.avg_score?.toFixed(1) || "N/A"}
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              <span>Total Responses</span>
              <div className="text-2xl font-semibold text-foreground">
                {totalResponses}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
