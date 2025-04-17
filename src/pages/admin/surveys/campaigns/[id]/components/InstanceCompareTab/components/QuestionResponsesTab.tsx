
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { useQuestionComparison } from "../hooks/useQuestionComparison";
import { QuestionCard } from "./QuestionCard";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CircleSlash, Search, SlidersHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface QuestionResponsesTabProps {
  campaignId?: string;
  baseInstanceId?: string;
  comparisonInstanceId?: string;
}

type QuestionType = "rating" | "boolean" | "text";

interface QuestionInfo {
  key: string;
  title: string;
  type: QuestionType;
}

export function QuestionResponsesTab({ campaignId, baseInstanceId, comparisonInstanceId }: QuestionResponsesTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | QuestionType>("all");
  const [selectedTypes, setSelectedTypes] = useState<QuestionType[]>(["rating", "boolean", "text"]);
  
  const { data: questionComparison, isLoading, error } = useQuestionComparison(
    campaignId,
    baseInstanceId,
    comparisonInstanceId
  );

  useEffect(() => {
    console.log("QuestionResponsesTab mounted with:", { 
      campaignId, 
      baseInstanceId, 
      comparisonInstanceId 
    });
  }, [campaignId, baseInstanceId, comparisonInstanceId]);

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

  // Type info with display names
  const questionTypeInfo = [
    { id: "rating", label: "Rating Questions" },
    { id: "boolean", label: "Boolean Questions" },
    { id: "text", label: "Text Questions" }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Question Response Comparison</span>
          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="rating">Rating</TabsTrigger>
                <TabsTrigger value="boolean">Boolean</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardTitle>
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
            <div className="mb-6 flex items-center justify-between gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="icon">
                    <SlidersHorizontal className="h-4 w-4" />
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

            {filteredQuestions.length === 0 ? (
              <div className="py-8 text-center text-muted-foreground">
                No matching questions found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {filteredQuestions.map((question) => (
                  <QuestionCard
                    key={question.key}
                    questionTitle={question.title}
                    questionType={question.type}
                    baseData={question.baseData}
                    comparisonData={question.comparisonData}
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
