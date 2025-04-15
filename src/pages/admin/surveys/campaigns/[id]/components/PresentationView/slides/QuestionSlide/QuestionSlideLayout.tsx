
import { cn } from "@/lib/utils";
import { CampaignData } from "../../types";

interface QuestionSlideLayoutProps {
  campaign: CampaignData;
  isActive: boolean;
  questionTitle: string;
  children: React.ReactNode;
}

export function QuestionSlideLayout({
  campaign,
  isActive,
  questionTitle,
  children,
}: QuestionSlideLayoutProps) {
  return (
    <div 
      className={cn(
        "absolute inset-0 transition-opacity duration-500 ease-in-out",
        "bg-gradient-to-br from-white to-gray-50",
        "rounded-lg shadow-lg p-4 md:p-6 lg:p-8",
        isActive ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
    >
      <div className="h-full flex flex-col">
        <div className="mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {questionTitle}
            {campaign.instance && (
              <span className="text-base md:text-lg font-normal text-gray-600 ml-2">
                (Period {campaign.instance.period_number})
              </span>
            )}
          </h2>
        </div>

        <div className="flex-1 flex justify-center min-h-0 overflow-y-auto">
          <div className="w-full">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
