
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend } from 'recharts';
import { TeamFeedbackQuestion } from '@/hooks/useReporteeFeedback';
import { ChartContainer, ChartTooltip } from '@/components/ui/chart';
import { Lightbulb, ChevronDown, ChevronUp, MessageSquare } from 'lucide-react';
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics';

interface EnhancedQuestionCardProps {
  question: TeamFeedbackQuestion;
}

export function EnhancedQuestionCard({ question }: EnhancedQuestionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const analytics = useFeedbackAnalytics();
  
  const toggleExpanded = () => {
    setExpanded(!expanded);
    
    // Log user interaction
    analytics.logEvent('toggle_question_card', { 
      question_id: question.question_name,
      question_type: question.question_type,
      expanded: !expanded
    });
  };

  // Chart configuration for styling
  const chartConfig = {
    rating: {
      color: '#8B5CF6'
    },
    boolean: {
      yes: { color: '#10B981' },
      no: { color: '#EF4444' },
    }
  };

  const renderChart = () => {
    if (question.question_type === 'rating' && question.distribution && Array.isArray(question.distribution)) {
      // Transform data to match chart format
      const data = question.distribution.map((item: any) => ({
        name: item.value.toString(),
        value: item.count
      }));
      
      return (
        <div className="h-64 w-full mt-4">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={data}
                margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Rating
                              </span>
                              <span className="font-bold text-muted-foreground">
                                {payload[0].payload.name}
                              </span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[0.70rem] uppercase text-muted-foreground">
                                Count
                              </span>
                              <span className="font-bold">
                                {payload[0].payload.value}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 0, 0]}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={`rgba(139, 92, 246, ${0.4 + (parseInt(entry.name) / 10)})`} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      );
    }
    
    if (question.question_type === 'boolean' && question.distribution) {
      const trueCount = question.distribution.true_count || 0;
      const falseCount = question.distribution.false_count || 0;
      const total = trueCount + falseCount;
      
      // For boolean questions, use a pie chart for consistency
      const data = [
        { name: 'Yes', value: trueCount, percentage: total > 0 ? (trueCount / total) * 100 : 0 },
        { name: 'No', value: falseCount, percentage: total > 0 ? (falseCount / total) * 100 : 0 }
      ];
      
      const COLORS = ['#10B981', '#EF4444'];
      
      return (
        <div className="h-64 w-full mt-4">
          <ChartContainer config={chartConfig}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percentage }) => `${name}: ${percentage.toFixed(0)}%`}
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} (${(data.find(item => item.name === name)?.percentage || 0).toFixed(0)}%)`, name]}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </div>
      );
    }
    
    if (question.question_type === 'text' && question.distribution) {
      return (
        <div className="mt-4 bg-muted p-4 rounded-md">
          <div className="flex items-center mb-2">
            <MessageSquare className="h-5 w-5 mr-2 text-muted-foreground" />
            <span className="font-medium">Text Responses</span>
          </div>
          {Array.isArray(question.distribution) && question.distribution.length > 0 ? (
            <p className="text-sm text-muted-foreground">
              {question.distribution.length} responses received.
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">No text responses available.</p>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <Card 
      className={`w-full transition-all duration-200 hover:shadow-md ${expanded ? 'border-primary/50' : ''}`}
      onClick={toggleExpanded}
    >
      <CardHeader className="cursor-pointer">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium flex items-center">
              {question.question_title}
              {question.question_type === 'rating' && question.avg_value !== null && (
                <Badge className="ml-2 bg-primary/10 text-primary hover:bg-primary/20">
                  Avg: {question.avg_value.toFixed(1)}
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1 flex items-center">
              <Badge
                variant="outline"
                className={
                  question.question_type === 'rating'
                    ? 'bg-blue-50 text-blue-700 hover:bg-blue-100'
                    : question.question_type === 'boolean'
                    ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }
              >
                {question.question_type}
              </Badge>
              <span className="ml-2 text-sm text-muted-foreground">
                {question.response_count} responses
              </span>
            </CardDescription>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0" 
            onClick={(e) => {
              e.stopPropagation();
              toggleExpanded();
            }}
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      
      {expanded && (
        <>
          <CardContent>
            {renderChart()}
            
            {question.question_type === 'rating' && question.avg_value !== null && (
              <div className="mt-4 flex items-center">
                <Lightbulb className="h-5 w-5 mr-2 text-amber-500" />
                <p className="text-sm text-muted-foreground">
                  {question.avg_value >= 4 
                    ? "This rating is positive. Team members seem satisfied in this area."
                    : question.avg_value >= 3 
                    ? "This rating is neutral. Consider exploring ways to improve this area."
                    : "This rating needs attention. Consider addressing this area promptly."
                  }
                </p>
              </div>
            )}
          </CardContent>
        </>
      )}
    </Card>
  );
}
