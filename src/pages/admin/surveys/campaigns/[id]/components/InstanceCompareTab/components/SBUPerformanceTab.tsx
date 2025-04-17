
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopSBUComparison } from "../hooks/useTopSBUComparison";

interface SBUPerformanceTabProps {
  campaignId?: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
}

export function SBUPerformanceTab({ 
  campaignId, 
  baseInstanceId, 
  comparisonInstanceId 
}: SBUPerformanceTabProps) {
  const { data: sbuComparison, isLoading: isLoadingSBUComparison } = useTopSBUComparison(
    campaignId,
    baseInstanceId,
    comparisonInstanceId
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>SBU Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoadingSBUComparison ? (
          <div>Loading SBU comparison data...</div>
        ) : sbuComparison && sbuComparison.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">SBU</th>
                  <th className="text-right p-2">Base Score</th>
                  <th className="text-right p-2">Base Rank</th>
                  <th className="text-right p-2">Comparison Score</th>
                  <th className="text-right p-2">Comparison Rank</th>
                  <th className="text-right p-2">Change</th>
                  <th className="text-right p-2">Rank Change</th>
                </tr>
              </thead>
              <tbody>
                {sbuComparison.map((sbu) => (
                  <tr key={sbu.name} className="border-b hover:bg-muted/50">
                    <td className="p-2">{sbu.name}</td>
                    <td className="text-right p-2">{sbu.base_score.toFixed(2)}</td>
                    <td className="text-right p-2">{sbu.base_rank}</td>
                    <td className="text-right p-2">{sbu.comparison_score.toFixed(2)}</td>
                    <td className="text-right p-2">{sbu.comparison_rank}</td>
                    <td className={`text-right p-2 ${sbu.change > 0 ? 'text-green-600' : sbu.change < 0 ? 'text-red-600' : ''}`}>
                      {sbu.change > 0 ? '+' : ''}{sbu.change.toFixed(2)}
                    </td>
                    <td className={`text-right p-2 ${sbu.rank_change > 0 ? 'text-green-600' : sbu.rank_change < 0 ? 'text-red-600' : ''}`}>
                      {sbu.rank_change > 0 ? '+' : ''}{sbu.rank_change}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div>No comparison data available.</div>
        )}
      </CardContent>
    </Card>
  );
}
