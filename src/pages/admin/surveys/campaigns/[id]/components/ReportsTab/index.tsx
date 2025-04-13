
import { useResponseProcessing } from "./hooks/useResponseProcessing";
import { QuestionReportCard } from "./components/QuestionReportCard";

interface ReportsTabProps {
  campaignId: string;
  instanceId?: string;
}

export function ReportsTab({ campaignId, instanceId }: ReportsTabProps) {
  const { data, isLoading } = useResponseProcessing(campaignId, instanceId);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!data || !data.questions || !data.responses) {
    return <div>No data available</div>;
  }

  return (
    <div className="grid gap-6">
      {data.questions.map((question) => (
        <QuestionReportCard
          key={question.name}
          campaignId={campaignId}
          instanceId={instanceId}
          question={question}
        />
      ))}
    </div>
  );
}
