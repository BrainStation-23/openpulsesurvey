
import { AssignmentInstanceList } from "./components/AssignmentInstanceList";

interface AssignmentsTabProps {
  campaignId: string;
  surveyId?: string;
  selectedInstanceId?: string;
}

export function AssignmentsTab({ campaignId, surveyId, selectedInstanceId }: AssignmentsTabProps) {
  return (
    <AssignmentInstanceList
      campaignId={campaignId}
      surveyId={surveyId}
      selectedInstanceId={selectedInstanceId}
    />
  );
}
