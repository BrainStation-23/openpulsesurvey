
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { NpsData } from "../types/nps";

interface NpsChartProps {
  data: Array<{
    rating: number;
    count: number;
    group?: string;
  }> | NpsData;
  showComparison?: boolean;
}

export function NpsChart({ data, showComparison = false }: NpsChartProps) {
  // Function to calculate average from an array of ratings
  const calculateAverage = (groupData: Array<{rating: number, count: number}>) => {
    if (!Array.isArray(groupData) || groupData.length === 0) return 0;
    
    const totalResponses = groupData.reduce((sum, item) => sum + item.count, 0);
    const weightedSum = groupData.reduce((sum, item) => sum + (item.rating * item.count), 0);
    return totalResponses ? Number((weightedSum / totalResponses).toFixed(1)) : 0;
  };

  const getScoreColor = (score: number) => {
    return score >= 8 ? 'text-green-500' : 'text-red-500';
  };

  // Handle NpsData object format
  if (!Array.isArray(data) && 'detractors' in data && 'promoters' in data && 'passives' in data) {
    // Convert NpsData object to display format
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

  // Handle array data format (original implementation)
  if (Array.isArray(data)) {
    // Group data by dimension if it exists
    const groupedData = data.reduce((acc, item) => {
      const group = item.group || 'Overall';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(item);
      return acc;
    }, {} as Record<string, typeof data>);

    return (
      <div className={showComparison ? "space-y-8" : "space-y-6"}>
        {Object.entries(groupedData).map(([group, groupData]) => {
          const totalResponses = groupData.reduce((sum, item) => sum + item.count, 0);
          const averageScore = calculateAverage(groupData);
          
          const segments = groupData.reduce((acc, item) => {
            if (item.rating <= 6) {
              acc.detractors += item.count;
            } else if (item.rating <= 8) {
              acc.passives += item.count;
            } else {
              acc.promoters += item.count;
            }
            return acc;
          }, { detractors: 0, passives: 0, promoters: 0 });

          const percentages = {
            detractors: (segments.detractors / totalResponses) * 100,
            passives: (segments.passives / totalResponses) * 100,
            promoters: (segments.promoters / totalResponses) * 100,
          };

          const npsScore = Math.round(percentages.promoters - percentages.detractors);

          return (
            <div key={group} className="space-y-6">
              <div className="flex items-center justify-between">
                {showComparison && (
                  <div className="text-lg font-semibold">{group}</div>
                )}
                <div className="flex items-center gap-6">
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">eNPS Score</div>
                    <div className={cn("text-2xl font-bold", getScoreColor(npsScore))}>
                      {npsScore}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm text-muted-foreground">Average Rating</div>
                    <div className={cn("text-2xl font-bold", getScoreColor(averageScore))}>
                      {averageScore}
                    </div>
                  </div>
                </div>
              </div>

              {/* Segments */}
              <div className="space-y-4">
                {/* Promoters */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Promoters</span>
                    <span className="font-medium">
                      {Math.round(percentages.promoters)}% ({segments.promoters})
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
                      {Math.round(percentages.passives)}% ({segments.passives})
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
                      {Math.round(percentages.detractors)}% ({segments.detractors})
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
        })}
      </div>
    );
  }

  // Fallback for empty or invalid data
  return <div className="text-center text-muted-foreground">No data available</div>;
}
