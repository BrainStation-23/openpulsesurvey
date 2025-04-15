
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { RatingResponseData, NpsData, SatisfactionData } from "../../PresentationView/types/responses";

// Union type for all rating data
export type RatingData = 
  | { type: 'nps'; data: RatingResponseData | NpsData }
  | { type: 'satisfaction'; data: SatisfactionData };

interface RatingScaleChartProps {
  data: RatingData;
  showComparison?: boolean;
}

export function RatingScaleChart({ data, showComparison = false }: RatingScaleChartProps) {
  if (data.type === 'nps') {
    return <NpsScaleChart data={data.data} showComparison={showComparison} />;
  } else {
    return <SatisfactionScaleChart data={data.data} showComparison={showComparison} />;
  }
}

interface NpsScaleChartProps {
  data: RatingResponseData | NpsData;
  showComparison?: boolean;
}

export function NpsScaleChart({ data, showComparison = false }: NpsScaleChartProps) {
  // Process NPS data
  const processNpsData = (data: RatingResponseData | NpsData) => {
    if ('detractors' in data) {
      // Already processed NPS data
      return data as NpsData;
    }

    // Array of rating data points
    const ratingData = data as RatingResponseData;
    const totalResponses = ratingData.reduce((sum, item) => sum + item.count, 0);
    
    // Extract rating groups
    const detractors = ratingData
      .filter(item => item.rating <= 6)
      .reduce((sum, item) => sum + item.count, 0);
    
    const passives = ratingData
      .filter(item => item.rating > 6 && item.rating <= 8)
      .reduce((sum, item) => sum + item.count, 0);
    
    const promoters = ratingData
      .filter(item => item.rating > 8)
      .reduce((sum, item) => sum + item.count, 0);
    
    const npsScore = Math.round(
      ((promoters - detractors) / totalResponses) * 100
    );

    return {
      detractors,
      passives,
      promoters,
      total: totalResponses,
      npsScore
    };
  };

  const calculateAverage = (ratingData: RatingResponseData) => {
    const totalResponses = ratingData.reduce((sum, item) => sum + item.count, 0);
    const weightedSum = ratingData.reduce((sum, item) => sum + (item.rating * item.count), 0);
    return totalResponses ? Number((weightedSum / totalResponses).toFixed(1)) : 0;
  };

  const getScoreColor = (score: number) => {
    return score >= 8 ? 'text-green-500' : 'text-red-500';
  };

  // Group data by dimension if it exists
  const processedData = processNpsData(data);
  const isRatingArray = !('detractors' in data);
  const averageScore = isRatingArray ? calculateAverage(data as RatingResponseData) : 0;

  const { detractors, passives, promoters, total, npsScore } = processedData;
  
  const percentages = {
    detractors: (detractors / total) * 100,
    passives: (passives / total) * 100,
    promoters: (promoters / total) * 100,
  };

  return (
    <div className={showComparison ? "space-y-8" : "space-y-6"}>
      <div className="flex items-center justify-between">
        <div className="text-lg font-semibold">eNPS Results</div>
        <div className="flex items-center gap-6">
          <div className="space-y-1">
            <div className="text-sm text-muted-foreground">eNPS Score</div>
            <div className={cn("text-2xl font-bold", getScoreColor(npsScore))}>
              {npsScore}
            </div>
          </div>
          {isRatingArray && (
            <div className="space-y-1">
              <div className="text-sm text-muted-foreground">Average Rating</div>
              <div className={cn("text-2xl font-bold", getScoreColor(averageScore))}>
                {averageScore}
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
              {Math.round(percentages.promoters)}% ({promoters})
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
              {Math.round(percentages.passives)}% ({passives})
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
              {Math.round(percentages.detractors)}% ({detractors})
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
        Total Responses: {total}
      </div>
    </div>
  );
}

interface SatisfactionScaleChartProps {
  data: SatisfactionData;
  showComparison?: boolean;
}

export function SatisfactionScaleChart({ data, showComparison = false }: SatisfactionScaleChartProps) {
  const getPercentage = (value: number) => {
    return Math.round((value / data.total) * 100);
  };

  const calculateAverage = () => {
    // Assuming: Unsatisfied = 1-2, Neutral = 3, Satisfied = 4-5
    const weightedSum = (data.unsatisfied * 1.5) + (data.neutral * 3) + (data.satisfied * 4.5);
    return (weightedSum / data.total).toFixed(1);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Response Distribution</h3>
          <p className="text-sm text-muted-foreground">
            Based on {data.total} responses
          </p>
        </div>
        <div className="flex gap-4">
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              {getPercentage(data.satisfied)}%
            </div>
            <div className="text-sm text-muted-foreground">Satisfaction Rate</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">
              {data.median.toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Median Score</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-purple-600">
              {calculateAverage()}
            </div>
            <div className="text-sm text-muted-foreground">Average Score</div>
          </div>
        </div>
      </div>

      {/* Satisfaction distribution visual */}
      <div className="flex h-8 w-full mt-4 mb-6 rounded-md overflow-hidden">
        <div 
          className="bg-red-500 h-full" 
          style={{ width: `${getPercentage(data.unsatisfied)}%` }}
          title={`Unsatisfied: ${getPercentage(data.unsatisfied)}%`}
        />
        <div 
          className="bg-yellow-500 h-full" 
          style={{ width: `${getPercentage(data.neutral)}%` }}
          title={`Neutral: ${getPercentage(data.neutral)}%`}
        />
        <div 
          className="bg-green-500 h-full" 
          style={{ width: `${getPercentage(data.satisfied)}%` }}
          title={`Satisfied: ${getPercentage(data.satisfied)}%`}
        />
      </div>

      <div className="grid grid-cols-3 gap-4 text-center text-sm">
        <div>
          <div className="font-medium text-red-600">Unsatisfied</div>
          <div className="text-lg font-semibold">
            {data.unsatisfied}
          </div>
          <div className="text-muted-foreground">
            {getPercentage(data.unsatisfied)}% of responses
          </div>
        </div>
        <div>
          <div className="font-medium text-yellow-600">Neutral</div>
          <div className="text-lg font-semibold">
            {data.neutral}
          </div>
          <div className="text-muted-foreground">
            {getPercentage(data.neutral)}% of responses
          </div>
        </div>
        <div>
          <div className="font-medium text-green-600">Satisfied</div>
          <div className="text-lg font-semibold">
            {data.satisfied}
          </div>
          <div className="text-muted-foreground">
            {getPercentage(data.satisfied)}% of responses
          </div>
        </div>
      </div>
    </div>
  );
}
