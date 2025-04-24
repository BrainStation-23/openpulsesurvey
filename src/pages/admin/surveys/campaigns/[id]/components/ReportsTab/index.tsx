
import { useState } from "react";
import { useResponseProcessing } from "./hooks/useResponseProcessing";
import { ComparisonDimension } from "./types/comparison";
import { QuestionCard } from "./components/QuestionCard";

export interface ReportsTabProps {
  campaignId: string;
  instanceId?: string;
}

export function ReportsTab({ campaignId, instanceId }: ReportsTabProps) {
  const { data, isLoading } = useResponseProcessing(campaignId, instanceId);
  const [comparisonDimensions, setComparisonDimensions] = useState<
    Record<string, ComparisonDimension>
  >({});

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !data.questions || !data.responses) {
    return <div>No data available</div>;
  }

  const handleComparisonChange = (questionName: string, dimension: ComparisonDimension) => {
    setComparisonDimensions((prev) => ({
      ...prev,
      [questionName]: dimension,
    }));
  };

  return (
    <div className="grid gap-6">
      {data.questions.map((question) => {
        const currentDimension = comparisonDimensions[question.name] || "none";
        
        return (
          <QuestionCard
            key={question.name}
            question={question}
            responses={data.responses}
            comparisonDimension={currentDimension}
            onComparisonChange={(dimension) => 
              handleComparisonChange(question.name, dimension)
            }
            campaignId={campaignId}
            instanceId={instanceId}
          />
        );
      })}
    </div>
  );
}
