
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

interface NpsComparisonTableProps {
  data: Array<{
    dimension: string;
    ratings: { rating: number; count: number }[];
  }>;
}

function calculateStats(ratings: { rating: number; count: number }[]) {
  // eNPS conventions
  const total = ratings.reduce((sum, item) => sum + item.count, 0);
  let detractors = 0, passives = 0, promoters = 0, weightedSum = 0;
  ratings.forEach(item => {
    weightedSum += item.rating * item.count;
    if (item.rating <= 6) detractors += item.count;
    else if (item.rating <= 8) passives += item.count;
    else promoters += item.count;
  });
  const average = total ? (weightedSum / total) : 0;
  const detractorsPct = total ? (detractors / total) * 100 : 0;
  const passivesPct = total ? (passives / total) * 100 : 0;
  const promotersPct = total ? (promoters / total) * 100 : 0;
  const npsScore = Math.round(promotersPct - detractorsPct);

  return {
    total,
    detractors,
    passives,
    promoters,
    detractorsPct,
    passivesPct,
    promotersPct,
    npsScore,
    average: Number(average.toFixed(1)),
  };
}

export function NpsComparisonTable({ data }: NpsComparisonTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[900px] rounded-xl border shadow-sm bg-white">
        <thead>
          <tr>
            <th className="text-left p-3 bg-gray-50">Group</th>
            <th className="text-center p-3 bg-gray-50 border-l">
              <span className="flex items-center gap-2 justify-center">
                <Badge className="bg-[#ef4444]/80 scale-90">D</Badge>
                Detractors <span className="text-xs">(0-6)</span>
              </span>
            </th>
            <th className="text-center p-3 bg-gray-50 border-l">
              <span className="flex items-center gap-2 justify-center">
                <Badge className="bg-[#eab308]/80 scale-90">P</Badge>
                Passives <span className="text-xs">(7-8)</span>
              </span>
            </th>
            <th className="text-center p-3 bg-gray-50 border-l">
              <span className="flex items-center gap-2 justify-center">
                <Badge className="bg-[#22c55e]/80 scale-90">P</Badge>
                Promoters <span className="text-xs">(9-10)</span>
              </span>
            </th>
            <th className="text-center p-3 bg-gray-50 border-l">eNPS Score</th>
            <th className="text-center p-3 bg-gray-50 border-l">Avg. Rating</th>
            <th className="text-center p-3 bg-gray-50 border-l">Responses</th>
          </tr>
        </thead>
        <tbody>
          {data.map((groupData, i) => {
            const stats = calculateStats(groupData.ratings);

            return (
              <tr key={groupData.dimension}
                className={
                  stats.npsScore < 0
                    ? "bg-red-50"
                    : stats.npsScore >= 60
                    ? "bg-green-50"
                    : undefined
                }
              >
                <td className="p-3 font-medium whitespace-nowrap">{groupData.dimension}</td>
                {/* Detractors */}
                <td className="text-center p-3 border-l min-w-[130px]">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="font-semibold text-red-500">{Math.round(stats.detractorsPct)}%</span>
                    <Progress value={stats.detractorsPct} className="h-2 bg-gray-100" indicatorClassName="bg-[#ef4444]" />
                    <span className="text-xs text-muted-foreground">{stats.detractors}</span>
                  </div>
                </td>
                {/* Passives */}
                <td className="text-center p-3 border-l min-w-[130px]">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="font-semibold text-yellow-500">{Math.round(stats.passivesPct)}%</span>
                    <Progress value={stats.passivesPct} className="h-2 bg-gray-100" indicatorClassName="bg-[#eab308]" />
                    <span className="text-xs text-muted-foreground">{stats.passives}</span>
                  </div>
                </td>
                {/* Promoters */}
                <td className="text-center p-3 border-l min-w-[130px]">
                  <div className="flex flex-col gap-1 items-center">
                    <span className="font-semibold text-green-600">{Math.round(stats.promotersPct)}%</span>
                    <Progress value={stats.promotersPct} className="h-2 bg-gray-100" indicatorClassName="bg-[#22c55e]" />
                    <span className="text-xs text-muted-foreground">{stats.promoters}</span>
                  </div>
                </td>
                {/* eNPS Score */}
                <td className={`text-center p-3 border-l font-bold ${stats.npsScore >= 0 ? "text-green-600" : "text-red-600"}`}>
                  {stats.npsScore}
                </td>
                {/* Average Rating */}
                <td className="text-center p-3 border-l font-medium">
                  <span>{stats.average}</span>
                </td>
                {/* Total Responses */}
                <td className="text-center p-3 border-l">{stats.total}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="text-xs text-muted-foreground mt-4 flex gap-6 flex-wrap px-1">
        <span>
          <Badge className="scale-75 bg-[#ef4444]/80 mr-1"></Badge>
          Detractors (0-6)
        </span>
        <span>
          <Badge className="scale-75 bg-[#eab308]/80 mr-1"></Badge>
          Passives (7-8)
        </span>
        <span>
          <Badge className="scale-75 bg-[#22c55e]/80 mr-1"></Badge>
          Promoters (9-10)
        </span>
        <span className="pl-2">
          <strong>Note:</strong> Colored row highlight: negative scores = poor, high positive = excellent.
        </span>
      </div>
    </div>
  );
}
