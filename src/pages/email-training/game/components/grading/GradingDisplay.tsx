
import { Card } from "@/components/ui/card";
import type { EmailGrade } from "../../types";
import { Check, AlertTriangle } from "lucide-react";

interface GradingDisplayProps {
  grade: EmailGrade;
  attemptNumber: number;
}

export function GradingDisplay({ grade, attemptNumber }: GradingDisplayProps) {
  const { scores, analysis } = grade;
  
  return (
    <Card className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Attempt {attemptNumber} Results</h3>
        <p className="text-muted-foreground">
          Total Score: {scores.total_score}/40
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <ScoreCard
          label="Professionalism"
          score={scores.professionalism}
          maxScore={10}
        />
        <ScoreCard
          label="Completeness"
          score={scores.completeness}
          maxScore={10}
        />
        <ScoreCard
          label="Clarity"
          score={scores.clarity}
          maxScore={10}
        />
        <ScoreCard
          label="Solution Quality"
          score={scores.solution_quality}
          maxScore={10}
        />
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <h4 className="font-medium text-green-600 dark:text-green-400 flex items-center gap-2">
            <Check className="h-4 w-4" />
            Strengths
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.strengths.map((strength, index) => (
              <li key={index} className="text-sm">{strength}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium text-yellow-600 dark:text-yellow-400 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Areas for Improvement
          </h4>
          <ul className="list-disc pl-5 space-y-1">
            {analysis.areas_for_improvement.map((area, index) => (
              <li key={index} className="text-sm">{area}</li>
            ))}
          </ul>
        </div>

        <div className="pt-2">
          <h4 className="font-medium mb-2">Detailed Feedback</h4>
          <p className="text-sm text-muted-foreground">{analysis.detailed_feedback}</p>
        </div>
      </div>
    </Card>
  );
}

interface ScoreCardProps {
  label: string;
  score: number;
  maxScore: number;
}

function ScoreCard({ label, score, maxScore }: ScoreCardProps) {
  const percentage = (score / maxScore) * 100;
  const getColor = () => {
    if (percentage >= 80) return "bg-green-500";
    if (percentage >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-sm text-muted-foreground">{score}/{maxScore}</span>
      </div>
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <div 
          className={`h-full ${getColor()} transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
