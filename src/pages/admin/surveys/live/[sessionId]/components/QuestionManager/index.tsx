
import { QuestionCard } from "./QuestionCard";
import { QuestionControls } from "./QuestionControls";

export function QuestionManager() {
  // TODO: Implement question management logic
  return (
    <div className="space-y-4">
      <QuestionControls />
      <div className="grid gap-4">
        Questions list will go here
      </div>
    </div>
  );
}
