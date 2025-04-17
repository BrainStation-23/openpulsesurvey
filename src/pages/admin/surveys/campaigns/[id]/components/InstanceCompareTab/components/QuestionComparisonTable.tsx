
import { 
  ArrowDown, 
  ArrowUp, 
  TrendingDown, 
  TrendingUp, 
  Minus,
  ChevronDown,
  ChevronUp, 
  ChevronsUpDown
} from "lucide-react";
import { useState } from "react";
import { ResponsiveTable } from "@/components/ui/responsive-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface QuestionData {
  period_number: number | null;
  campaign_instance_id: string | null;
  response_count: number | null;
  avg_numeric_value: number | null;
  yes_percentage: number | null;
  question_key: string | null;
  text_responses: string[] | null;
}

interface QuestionComparisonTableProps {
  questions: Array<{
    key: string;
    title: string;
    type: "rating" | "boolean" | "text";
    baseData: QuestionData;
    comparisonData: QuestionData;
  }>;
  basePeriod: string | number;
  comparisonPeriod: string | number;
}

type SortField = "question" | "type" | "baseScore" | "comparisonScore" | "change";
type SortDirection = "asc" | "desc";

export function QuestionComparisonTable({ 
  questions, 
  basePeriod, 
  comparisonPeriod 
}: QuestionComparisonTableProps) {
  const [sortField, setSortField] = useState<SortField>("question");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ChevronsUpDown className="h-4 w-4" />;
    return sortDirection === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />;
  };

  // Sort questions based on current sort field and direction
  const sortedQuestions = [...questions].sort((a, b) => {
    const sortMultiplier = sortDirection === "asc" ? 1 : -1;
    
    switch (sortField) {
      case "question":
        return sortMultiplier * a.title.localeCompare(b.title);
      case "type":
        return sortMultiplier * a.type.localeCompare(b.type);
      case "baseScore":
        const aBaseScore = a.type === "rating" ? a.baseData.avg_numeric_value || 0 : 
                           a.type === "boolean" ? a.baseData.yes_percentage || 0 : 0;
        const bBaseScore = b.type === "rating" ? b.baseData.avg_numeric_value || 0 : 
                           b.type === "boolean" ? b.baseData.yes_percentage || 0 : 0;
        return sortMultiplier * (aBaseScore - bBaseScore);
      case "comparisonScore":
        const aCompScore = a.type === "rating" ? a.comparisonData.avg_numeric_value || 0 : 
                           a.type === "boolean" ? a.comparisonData.yes_percentage || 0 : 0;
        const bCompScore = b.type === "rating" ? b.comparisonData.avg_numeric_value || 0 : 
                           b.type === "boolean" ? b.comparisonData.yes_percentage || 0 : 0;
        return sortMultiplier * (aCompScore - bCompScore);
      case "change":
        const aBase = a.type === "rating" ? a.baseData.avg_numeric_value || 0 : 
                      a.type === "boolean" ? a.baseData.yes_percentage || 0 : 0;
        const aComp = a.type === "rating" ? a.comparisonData.avg_numeric_value || 0 : 
                      a.type === "boolean" ? a.comparisonData.yes_percentage || 0 : 0;
        const bBase = b.type === "rating" ? b.baseData.avg_numeric_value || 0 : 
                      b.type === "boolean" ? b.baseData.yes_percentage || 0 : 0;
        const bComp = b.type === "rating" ? b.comparisonData.avg_numeric_value || 0 : 
                      b.type === "boolean" ? b.comparisonData.yes_percentage || 0 : 0;
        return sortMultiplier * ((aComp - aBase) - (bComp - bBase));
      default:
        return 0;
    }
  });

  return (
    <div className="rounded-md border">
      <ResponsiveTable>
        <ResponsiveTable.Header>
          <ResponsiveTable.Row>
            <ResponsiveTable.Head className="cursor-pointer" onClick={() => toggleSort("question")}>
              <div className="flex items-center gap-1">
                Question {getSortIcon("question")}
              </div>
            </ResponsiveTable.Head>
            <ResponsiveTable.Head className="cursor-pointer" onClick={() => toggleSort("type")}>
              <div className="flex items-center gap-1">
                Type {getSortIcon("type")}
              </div>
            </ResponsiveTable.Head>
            <ResponsiveTable.Head className="cursor-pointer text-right" onClick={() => toggleSort("baseScore")}>
              <div className="flex items-center justify-end gap-1">
                Period {basePeriod} {getSortIcon("baseScore")}
              </div>
            </ResponsiveTable.Head>
            <ResponsiveTable.Head className="cursor-pointer text-right" onClick={() => toggleSort("comparisonScore")}>
              <div className="flex items-center justify-end gap-1">
                Period {comparisonPeriod} {getSortIcon("comparisonScore")}
              </div>
            </ResponsiveTable.Head>
            <ResponsiveTable.Head className="cursor-pointer text-right" onClick={() => toggleSort("change")}>
              <div className="flex items-center justify-end gap-1">
                Change {getSortIcon("change")}
              </div>
            </ResponsiveTable.Head>
          </ResponsiveTable.Row>
        </ResponsiveTable.Header>
        <ResponsiveTable.Body>
          {sortedQuestions.map((question) => {
            // Calculate score changes for rating and boolean questions
            let baseScore = null;
            let comparisonScore = null;
            let scoreChange = 0;
            let scoreChangePercentage = 0;
            
            if (question.type === "rating" && 
                question.baseData.avg_numeric_value !== null && 
                question.comparisonData.avg_numeric_value !== null) {
              baseScore = question.baseData.avg_numeric_value;
              comparisonScore = question.comparisonData.avg_numeric_value;
              scoreChange = comparisonScore - baseScore;
              if (baseScore > 0) {
                scoreChangePercentage = (scoreChange / baseScore) * 100;
              }
            } else if (question.type === "boolean" && 
                question.baseData.yes_percentage !== null && 
                question.comparisonData.yes_percentage !== null) {
              baseScore = question.baseData.yes_percentage;
              comparisonScore = question.comparisonData.yes_percentage;
              scoreChange = comparisonScore - baseScore;
            }
            
            // Determine if change is significant (more than 5%)
            const isSignificantChange = 
              Math.abs(scoreChangePercentage) > 5 || Math.abs(scoreChange) > 0.5;
            
            return (
              <ResponsiveTable.Row key={question.key}>
                <ResponsiveTable.Cell>
                  {question.title}
                </ResponsiveTable.Cell>
                <ResponsiveTable.Cell>
                  <Badge variant="outline">{question.type}</Badge>
                </ResponsiveTable.Cell>
                <ResponsiveTable.Cell className="text-right">
                  {question.type === 'rating' && question.baseData.avg_numeric_value !== null ? (
                    <div className="text-right">
                      <div className="font-medium">{question.baseData.avg_numeric_value.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {question.baseData.response_count || 0} responses
                      </div>
                    </div>
                  ) : question.type === 'boolean' && question.baseData.yes_percentage !== null ? (
                    <div className="text-right">
                      <div className="font-medium">{question.baseData.yes_percentage.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">
                        {question.baseData.response_count || 0} responses
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {question.baseData.response_count || 0} responses
                      </div>
                    </div>
                  )}
                </ResponsiveTable.Cell>
                <ResponsiveTable.Cell className="text-right">
                  {question.type === 'rating' && question.comparisonData.avg_numeric_value !== null ? (
                    <div className="text-right">
                      <div className="font-medium">{question.comparisonData.avg_numeric_value.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {question.comparisonData.response_count || 0} responses
                      </div>
                    </div>
                  ) : question.type === 'boolean' && question.comparisonData.yes_percentage !== null ? (
                    <div className="text-right">
                      <div className="font-medium">{question.comparisonData.yes_percentage.toFixed(1)}%</div>
                      <div className="text-xs text-muted-foreground">
                        {question.comparisonData.response_count || 0} responses
                      </div>
                    </div>
                  ) : (
                    <div className="text-right">
                      <div className="text-xs text-muted-foreground">
                        {question.comparisonData.response_count || 0} responses
                      </div>
                    </div>
                  )}
                </ResponsiveTable.Cell>
                <ResponsiveTable.Cell className="text-right">
                  {baseScore !== null && comparisonScore !== null ? (
                    <div className="flex items-center justify-end space-x-1">
                      {scoreChange > 0 ? (
                        <TrendingUp className={`h-4 w-4 ${isSignificantChange ? 'text-green-500' : 'text-muted-foreground'}`} />
                      ) : scoreChange < 0 ? (
                        <TrendingDown className={`h-4 w-4 ${isSignificantChange ? 'text-red-500' : 'text-muted-foreground'}`} />
                      ) : (
                        <Minus className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className={`${
                        scoreChange > 0
                          ? isSignificantChange ? 'text-green-500' : 'text-muted-foreground'
                          : scoreChange < 0
                          ? isSignificantChange ? 'text-red-500' : 'text-muted-foreground'
                          : 'text-muted-foreground'
                      }`}>
                        {scoreChange > 0 ? '+' : ''}
                        {question.type === 'rating' ? 
                          scoreChange.toFixed(2) : 
                          `${scoreChange.toFixed(1)}%`
                        }
                      </span>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">--</span>
                  )}
                </ResponsiveTable.Cell>
              </ResponsiveTable.Row>
            );
          })}
        </ResponsiveTable.Body>
      </ResponsiveTable>
    </div>
  );
}
