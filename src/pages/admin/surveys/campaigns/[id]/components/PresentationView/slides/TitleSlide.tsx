
import { SlideProps } from "../types";
import { SlideWrapper } from "../components/SlideWrapper";

export function TitleSlide({ campaign, isActive }: SlideProps) {
  const surveyTitle = campaign.survey.name || "";
  const campaignName = campaign.name || "";
  
  return (
    <SlideWrapper isActive={isActive} className="bg-gradient-to-br from-primary-50 to-gray-100">
      <div className="flex flex-col items-center justify-center h-full p-10 text-center">
        <div className="mb-8 text-primary">
          {campaign.survey.json_data.logo && (
            <img 
              src={campaign.survey.json_data.logo} 
              alt="Survey Logo"
              className="max-h-16 mx-auto mb-6"
            />
          )}
        </div>
        
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
          {campaignName}
        </h1>
        
        {surveyTitle && (
          <h2 className="text-xl md:text-2xl text-gray-600 mb-8">
            {surveyTitle}
          </h2>
        )}
        
        {campaign.instance && (
          <div className="mt-2 md:mt-4 text-lg bg-primary/10 rounded-full px-4 py-1 text-primary-900">
            Period {campaign.instance.period_number}
          </div>
        )}
      </div>
    </SlideWrapper>
  );
}
