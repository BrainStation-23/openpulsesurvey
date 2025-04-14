
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePresentationResponses } from "../PresentationView/hooks/usePresentationResponses";
import { useResponseProcessing } from "./hooks/useResponseProcessing";
import { CampaignData } from "../PresentationView/types";
import { BooleanComparison } from "./components/comparisons/BooleanComparison";
import { TextComparison } from "./components/comparisons/TextComparison";
import { NpsComparison } from "./components/comparisons/NpsComparison";
import { ComparisonSelector } from "./components/ComparisonSelector";
import { ComparisonDimension } from "./types/comparison";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ReportsTabProps {
  campaign: CampaignData;
  instanceId?: string;
}

export function ReportsTab({ campaign, instanceId }: ReportsTabProps) {
  const [selectedComparisonDimension, setSelectedComparisonDimension] = useState<ComparisonDimension>("none");
  const [activeTab, setActiveTab] = useState("overview");
  
  const { data: responseData, isLoading } = usePresentationResponses(campaign.id, instanceId);
  const { aggregatedResponses, questionsMap } = useResponseProcessing(responseData);

  const surveyQuestions = (campaign?.survey.json_data.pages || [])
    .flatMap((page) => page.elements || [])
    .filter((question) => !["html", "panel"].includes(question.type || ""));

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <LoadingSpinner />
      </div>
    );
  }
  
  return (
    <div className="space-y-6 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Survey Responses Analysis</h2>
        <ComparisonSelector 
          value={selectedComparisonDimension} 
          onChange={setSelectedComparisonDimension} 
        />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          {surveyQuestions.map((question) => (
            <TabsTrigger key={question.name} value={question.name}>
              {question.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Survey Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Select a question tab above to view detailed responses and analyses for each question.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {surveyQuestions.map((question) => (
          <TabsContent key={question.name} value={question.name}>
            <Card>
              <CardHeader>
                <CardTitle>{question.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-end mb-4">
                  <ComparisonSelector 
                    value={selectedComparisonDimension} 
                    onChange={setSelectedComparisonDimension} 
                    questionType={question.type}
                    rateCount={question.rateCount}
                  />
                </div>
                {question.type === "boolean" && aggregatedResponses && (
                  <BooleanComparison
                    responses={aggregatedResponses}
                    questionName={question.name}
                    dimension={selectedComparisonDimension}
                  />
                )}
                {(question.type === "text" || question.type === "comment") && aggregatedResponses && (
                  <TextComparison
                    responses={aggregatedResponses}
                    questionName={question.name}
                    dimension={selectedComparisonDimension}
                  />
                )}
                {question.type === "rating" && aggregatedResponses && (
                  <NpsComparison
                    responses={aggregatedResponses}
                    questionName={question.name}
                    dimension={selectedComparisonDimension}
                    isNps={question.rateCount === 10}
                    campaignId={campaign.id}
                    instanceId={instanceId}
                  />
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
