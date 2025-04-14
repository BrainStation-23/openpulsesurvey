
import { RPCResponseItem } from "./types";
import { ResponseGroup } from "./ResponseGroup";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface ResponsesListProps {
  responses: RPCResponseItem[];
  isLoading?: boolean;
  onViewResponse: (response: RPCResponseItem) => void;
}

export function ResponsesList({ responses, isLoading = false, onViewResponse }: ResponsesListProps) {
  if (isLoading) {
    return (
      <div className="w-full h-48 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!responses.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No responses found for this period.
      </div>
    );
  }

  return <ResponseGroup responses={responses} onViewResponse={onViewResponse} />;
}
