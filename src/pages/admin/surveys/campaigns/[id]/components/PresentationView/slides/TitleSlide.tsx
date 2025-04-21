
import { SlideProps } from "../types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { SlideWrapper } from "../components/SlideWrapper";
import { Card } from "@/components/ui/card";

export function TitleSlide({ campaign, isActive }: SlideProps) {
  // Use instance dates and completion rate if available, otherwise use campaign data
  const startDate = campaign.instance?.starts_at || campaign.starts_at;
  const endDate = campaign.instance?.ends_at || campaign.ends_at;
  const completionRate = campaign.instance?.completion_rate ?? campaign.completion_rate;

  return (
    <SlideWrapper isActive={isActive} campaign={campaign}>
      <Card className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-gray-50 shadow-lg rounded-lg p-8">
        <div className="w-full max-w-2xl flex flex-col justify-center items-center space-y-8">
          <div className="space-y-4 text-center">
            <h1 className="text-4xl font-bold text-gray-900">{campaign.name}</h1>
            {campaign.instance && (
              <p className="text-xl text-primary">Period {campaign.instance.period_number}</p>
            )}
            {campaign.description && (
              <p className="text-xl text-gray-600">{campaign.description}</p>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase text-center md:text-left">Period</h3>
              <p className="text-lg text-gray-900 text-center md:text-left">
                {format(new Date(startDate), "PPP")} -{" "}
                {format(new Date(endDate), "PPP")}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 uppercase text-center md:text-left">Completion Rate</h3>
              <p className="text-3xl font-bold text-primary text-center md:text-left">
                {completionRate?.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
      </Card>
    </SlideWrapper>
  );
}
