
import { Response } from "./types";
import { ResponseGroup } from "./ResponseGroup";

interface ResponsesListProps {
  responses: Response[];
}

export function ResponsesList({ responses }: ResponsesListProps) {
  if (!responses.length) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No responses found for this period.
      </div>
    );
  }

  return <ResponseGroup responses={responses} />;
}
