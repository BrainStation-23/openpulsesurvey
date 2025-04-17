
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useQuestionComparison } from "../hooks/useQuestionComparison";
import { QuestionCard } from "./QuestionCard";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleSlash, Download, Search, SlidersHorizontal, Table as TableIcon, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { QuestionComparisonTable } from "./QuestionComparisonTable";
import { format } from "date-fns";

interface QuestionResponsesTabProps {
  campaignId?: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
}

type QuestionType = "rating" | "boolean" | "text";
type ViewMode = "cards" | "table";

interface QuestionInfo {
  key: string;
  title: string;
  type: QuestionType;
}

export function QuestionResponsesTab({ campaignId, baseInstanceId, comparisonInstanceId }: QuestionResponsesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | QuestionType>("all");
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["rating", "boolean", "text"]);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  
  const { data: questionComparison, isLoading, error } = useQuestionComparison(
    campaignId,
    baseInstanceId,
    comparisonInstanceId
  );

  // Process the data to match questions between instances
  const processedQuestions = questionComparison ? processQuestionData(questionComparison) : [];

  // Filter questions based on search and type
  const filteredQuestions = processedQuestions.filter(q => {
    const matchesSearch = searchQuery === "" || 
      q.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = activeTab === "all" || q.type === activeTab;
    
    const matchesSelectedTypes = selectedTypes.includes(q.type);
    
    return matchesSearch && matchesType && matchesSelectedTypes;
  });

  // Function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return format(new Date(dateString), "MMM d, yyyy");
  };

  // Get date ranges for instances
  const basePeriod = questionComparison?.baseInstance[0]?.period_number || "N/A";
  const comparisonPeriod = questionComparison?.comparisonInstance[0]?.period_number || "N/A";

  // Export data to CSV
  const exportToCSV = () => {
    if (!filteredQuestions.length) return;
    
    const headers = [
      "Question",
      "Type",
      `Period ${basePeriod} Score`,
      `Period ${basePeriod} Responses`,
      `Period ${comparisonPeriod} Score`,
      `Period ${comparisonPeriod} Responses`,
      "Change"
    ];
    
    const rows = filteredQuestions.map(q => {
      let baseScore = "N/A";
      let comparisonScore = "N/A";
      let changeValue = "N/A";
      
      if (q.type === "rating" && q.baseData.avg_numeric_value !== null && q.comparisonData.avg_numeric_value !== null) {
        baseScore = q.baseData.avg_numeric_value.toFixed(2);
        comparisonScore = q.comparisonData.avg_numeric_value.toFixed(2);
        changeValue = (q.comparisonData.avg_numeric_value - q.baseData.avg_numeric_value).toFixed(2);
      } else if (q.type === "boolean" && q.baseData.yes_percentage !== null && q.comparisonData.yes_percentage !== null) {
        baseScore = `${q.baseData.yes_percentage.toFixed(1)}%`;
        comparisonScore = `${q.comparisonData.yes_percentage.toFixed(1)}%`;
        changeValue = `${(q.comparisonData.yes_percentage - q.baseData.yes_percentage).toFixed(1)}%`;
      }
      
      return [
        q.title,
        q.type,
        baseScore,
        q.baseData.response_count || 0,
        comparisonScore,
        q.comparisonData.response_count || 0,
        changeValue
      ];
    });
    
    const csvContent = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `question_comparison_${basePeriod}_vs_${comparisonPeriod}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Type info with display names
  const questionTypeInfo = [
    { id: "rating", label: "Rating Questions" },
    { id: "boolean", label: "Boolean Questions" },
    { id: "text", label: "Text Questions" }
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col space-y-3 sm:flex-row sm:justify-between sm:space-y-0">
          <CardTitle>Question Response Comparison</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-md border">
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-l-md ${viewMode === 'cards' ? 'bg-muted' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Cards
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`rounded-r-md ${viewMode === 'table' ? 'bg-muted' : ''}`}
                onClick={() => setViewMode('table')}
              >
                <TableIcon className="h-4 w-4 mr-2" />
                Table
              </Button>
            </div>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="rating">Rating</TabsTrigger>
                <TabsTrigger value="boolean">Boolean</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
        
        {/* Period information */}
        {questionComparison?.baseInstance.length > 0 && questionComparison?.comparisonInstance.length > 0 && (
          <div className="mt-2 text-sm text-muted-foreground">
            Comparing Period {basePeriod} vs Period {comparisonPeriod}
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Spinner className="h-8 w-8 text-primary" />
            <p className="mt-4 text-sm text-muted-foreground">
              Loading question comparison data...
            </p>
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertDescription>
              Error loading question comparison data. Please try again later.
            </AlertDescription>
          </Alert>
        ) : processedQuestions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <CircleSlash className="h-12 w-12 mb-4 opacity-20" />
            <p>No question comparison data available.</p>
          </div>
        ) : (
          <>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={exportToCSV}
                  className="flex items-center gap-1"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" size="sm">
                      <SlidersHorizontal className="h-4 w-4 mr-2" />
                      Filter
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-56" align="end">
                    <div className="space-y-2">
                      <h4 className="font-medium">Filter by question type</h4>
                      <div className="space-y-2">
                        {questionTypeInfo.map((type) => (
                          <div key={type.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={`filter-${type.id}`}
                              checked={selectedTypes.includes(type.id as QuestionType)}
                              onCheckedChange={(checked) => {
                                if (checked) {
                                  setSelectedTypes([...selectedTypes, type.id as QuestionType]);
                                } else {
                                  setSelectedTypes(selectedTypes.filter(t => t !== type.id));
                                }
                              }}
                            />
                            <Label htmlFor={`filter-${type.id}`}>{type.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {filteredQuestions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No matching questions found.
              </div>
            ) : viewMode === 'table' ? (
              <QuestionComparisonTable 
                questions={filteredQuestions}
                basePeriod={basePeriod}
                comparisonPeriod={comparisonPeriod}
              />
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.key}
                    questionTitle={question.title}
                    questionType={question.type}
                    baseData={question.baseData}
                    comparisonData={question.comparisonData}
                    basePeriod={basePeriod.toString()}
                    comparisonPeriod={comparisonPeriod.toString()}
                  />
                ))}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredQuestions.length} of {processedQuestions.length} questions
              </span>
              <div className="flex gap-2">
                {["rating", "boolean", "text"].map((type) => {
                  const count = processedQuestions.filter(q => q.type === type).length;
                  if (count === 0) return null;
                  return (
                    <Badge key={type} variant="outline">
                      {type}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to process question data
function processQuestionData(data: any) {
  const { baseInstance, comparisonInstance } = data;
  const questionMap = new Map<string, QuestionInfo>();
  const result: Array<{
    key: string;
    title: string;
    type: QuestionType;
    baseData: any;
    comparisonData: any;
  }> = [];

  // First pass - collect all unique questions and determine their types
  [...baseInstance, ...comparisonInstance].forEach(item => {
    if (!item.question_key) return;
    
    // Skip if already processed
    if (questionMap.has(item.question_key)) return;
    
    let type: QuestionType = "text";
    if (item.avg_numeric_value !== null) {
      type = "rating";
    } else if (item.yes_percentage !== null) {
      type = "boolean";
    }
    
    // Use the question key as the title if not provided
    // In a real implementation, you'd probably want to fetch actual question titles
    const title = item.question_key;
    
    questionMap.set(item.question_key, {
      key: item.question_key,
      title,
      type
    });
  });

  // Second pass - match questions between instances
  questionMap.forEach((questionInfo, key) => {
    const baseData = baseInstance.find((item: any) => item.question_key === key) || null;
    const comparisonData = comparisonInstance.find((item: any) => item.question_key === key) || null;
    
    if (baseData || comparisonData) {
      result.push({
        ...questionInfo,
        baseData: baseData || createEmptyQuestionData(key),
        comparisonData: comparisonData || createEmptyQuestionData(key)
      });
    }
  });

  return result;
}

// Helper to create empty question data for missing entries
function createEmptyQuestionData(questionKey: string) {
  return {
    period_number: null,
    campaign_instance_id: null,
    response_count: 0,
    avg_numeric_value: null,
    yes_percentage: null,
    question_key: questionKey,
    text_responses: null
  };
}
