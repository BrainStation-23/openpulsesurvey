
import { cn } from "@/lib/utils";
import { NpsData } from "../types/nps";
import { GaugeChart } from "@/components/ui/gauge-chart";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";

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
      <div className="flex items-center justify-between">
        <div className="flex-1" />
        <div className="flex-1">
          <GaugeChart 
            value={Math.round(data.nps_score)} 
            label="eNPS Score"
            size="lg"
          />
        </div>
        <div className="flex-1 text-right">
          <HoverCard>
            <HoverCardTrigger asChild>
              <div className="cursor-help">
                <div className="text-5xl font-bold text-primary">
                  {data.avg_score?.toFixed(1)}
                </div>
                <div className="text-xl text-muted-foreground mt-2">
                  Average Rating
                </div>
              </div>
            </HoverCardTrigger>
            <HoverCardContent className="w-80">
              <p className="text-sm text-muted-foreground">
                Average rating represents the mean score from all responses on a scale of 0-10.
              </p>
            </HoverCardContent>
          </HoverCard>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-center">Response Distribution</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-2 text-sm cursor-help">
                  <span className="w-3 h-3 rounded-full bg-destructive" />
                  <span>Detractors (0-6)</span>
                  <span className="ml-auto font-semibold">{percentages.detractors}%</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="text-sm">Respondents who gave a score of 0-6, indicating dissatisfaction</p>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-2 text-sm cursor-help">
                  <span className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span>Passives (7-8)</span>
                  <span className="ml-auto font-semibold">{percentages.passives}%</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="text-sm">Respondents who gave a score of 7-8, indicating moderate satisfaction</p>
              </HoverCardContent>
            </HoverCard>

            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-2 text-sm cursor-help">
                  <span className="w-3 h-3 rounded-full bg-green-500" />
                  <span>Promoters (9-10)</span>
                  <span className="ml-auto font-semibold">{percentages.promoters}%</span>
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="text-sm">Respondents who gave a score of 9-10, indicating high satisfaction</p>
              </HoverCardContent>
            </HoverCard>
          </div>
          
          <div className="space-y-2 border-l pl-4">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="cursor-help">
                  <span className="text-sm text-muted-foreground">Total Responses</span>
                  <div className="text-2xl font-semibold text-foreground">
                    {totalResponses}
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent>
                <p className="text-sm">Total number of responses received for this survey</p>
              </HoverCardContent>
            </HoverCard>
          </div>
        </div>
      </div>
    </div>
  );
}
