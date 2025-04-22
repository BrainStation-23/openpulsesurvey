
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowDown, ArrowUp, Minus, Sparkles } from "lucide-react";

interface QuestionComparisonTableProps {
  questions: Array<{
    key: string;
    title: string;
    type: "rating" | "boolean" | "text";
    baseData: any;
    comparisonData: any;
  }>;
  basePeriod: string | number;
  comparisonPeriod: string | number;
}

export function QuestionComparisonTable({ 
  questions, 
  basePeriod, 
  comparisonPeriod 
}: QuestionComparisonTableProps) {
  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader className="bg-gray-50">
          <TableRow>
            <TableHead className="w-[40%]">Question</TableHead>
            <TableHead className="w-[12%]">Type</TableHead>
            <TableHead className="w-[15%] text-right">Period {basePeriod}</TableHead>
            <TableHead className="w-[15%] text-right">Period {comparisonPeriod}</TableHead>
            <TableHead className="w-[18%] text-right">Change</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {questions.map((question) => {
            // Calculate the change for different question types
            let baseValue: number | string = "N/A";
            let comparisonValue: number | string = "N/A";
            let change: number | null = null;
            let changePercentage: number | null = null;
            let isSignificant = false;
            
            if (question.type === "rating" && 
                question.baseData.avg_numeric_value !== null && 
                question.comparisonData.avg_numeric_value !== null) {
              
              baseValue = question.baseData.avg_numeric_value;
              comparisonValue = question.comparisonData.avg_numeric_value;
              change = comparisonValue - baseValue;
              
              if (baseValue > 0) {
                changePercentage = (change / baseValue) * 100;
              }
              
              isSignificant = Math.abs(changePercentage || 0) > 5 || Math.abs(change) > 0.5;
              
            } else if (question.type === "boolean" && 
                      question.baseData.yes_percentage !== null && 
                      question.comparisonData.yes_percentage !== null) {
              
              baseValue = question.baseData.yes_percentage;
              comparisonValue = question.comparisonData.yes_percentage;
              change = comparisonValue - baseValue;
              isSignificant = Math.abs(change) > 5;
            }
            
            return (
              <TableRow key={question.key} className="hover:bg-gray-50">
                <TableCell className="font-medium flex items-center gap-2">
                  {question.title}
                  {isSignificant && (
                    <Sparkles size={16} className={change && change > 0 ? "text-amber-500" : "text-blue-500"} />
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={`${question.type === 'rating' ? 'bg-blue-100 text-blue-800 hover:bg-blue-200' : 
                                    question.type === 'boolean' ? 'bg-purple-100 text-purple-800 hover:bg-purple-200' : 
                                    'bg-gray-100 text-gray-800 hover:bg-gray-200'}`}>
                    {question.type}
                  </Badge>
                </TableCell>
                <TableCell className="text-right font-mono">
                  {question.type === "rating" && typeof baseValue === "number" ? (
                    <div>
                      <span className="font-medium">{baseValue.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({question.baseData.response_count || 0})
                      </span>
                    </div>
                  ) : question.type === "boolean" && typeof baseValue === "number" ? (
                    <div>
                      <span className="font-medium">{baseValue.toFixed(1)}%</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({question.baseData.response_count || 0})
                      </span>
                    </div>
                  ) : (
                    <span>{question.baseData.response_count || 0}</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {question.type === "rating" && typeof comparisonValue === "number" ? (
                    <div>
                      <span className="font-medium">{comparisonValue.toFixed(2)}</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({question.comparisonData.response_count || 0})
                      </span>
                    </div>
                  ) : question.type === "boolean" && typeof comparisonValue === "number" ? (
                    <div>
                      <span className="font-medium">{comparisonValue.toFixed(1)}%</span>
                      <span className="text-xs text-muted-foreground ml-1">
                        ({question.comparisonData.response_count || 0})
                      </span>
                    </div>
                  ) : (
                    <span>{question.comparisonData.response_count || 0}</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {change !== null ? (
                    <div className="flex items-center justify-end">
                      <span className={`font-medium flex items-center 
                        ${change > 0 
                          ? isSignificant ? 'text-green-600' : 'text-green-500' 
                          : change < 0 
                          ? isSignificant ? 'text-red-600' : 'text-red-500'
                          : 'text-gray-500'}`}
                      >
                        {change > 0 ? '+' : ''}{question.type === 'rating' ? change.toFixed(2) : `${change.toFixed(1)}%`}
                        {change > 0 ? (
                          <ArrowUp className="ml-1 h-3 w-3" />
                        ) : change < 0 ? (
                          <ArrowDown className="ml-1 h-3 w-3" />
                        ) : (
                          <Minus className="ml-1 h-3 w-3" />
                        )}
                      </span>
                      {isSignificant && changePercentage !== null && question.type === 'rating' && (
                        <span className="text-xs ml-1 text-muted-foreground">
                          ({changePercentage > 0 ? '+' : ''}{changePercentage.toFixed(1)}%)
                        </span>
                      )}
                    </div>
                  ) : question.type === 'text' ? (
                    <span className={`font-medium ${
                      (question.comparisonData.response_count || 0) > (question.baseData.response_count || 0)
                        ? 'text-green-600'
                        : (question.comparisonData.response_count || 0) < (question.baseData.response_count || 0)
                        ? 'text-red-600'
                        : 'text-gray-500'
                    }`}>
                      {(question.comparisonData.response_count || 0) - (question.baseData.response_count || 0)}
                    </span>
                  ) : (
                    <span>N/A</span>
                  )}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
