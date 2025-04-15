
import React from "react";
import { Progress } from "@/components/ui/progress";
import { NpsData } from "../../../types/responses";

interface NpsRatingViewProps {
  data: NpsData;
}

export const NpsRatingView: React.FC<NpsRatingViewProps> = ({ data }) => {
  const totalResponses = data.total;
  const percentages = {
    detractors: totalResponses > 0 ? (data.detractors / totalResponses) * 100 : 0,
    passives: totalResponses > 0 ? (data.passives / totalResponses) * 100 : 0,
    promoters: totalResponses > 0 ? (data.promoters / totalResponses) * 100 : 0,
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="text-sm text-muted-foreground">NPS Score</div>
          <div className={`text-2xl font-bold ${data.npsScore >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {data.npsScore}
          </div>
        </div>
      </div>

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

      <div className="text-center text-sm text-muted-foreground">
        Total Responses: {totalResponses}
      </div>
    </div>
  );
};
