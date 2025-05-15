
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart4, MessageSquare, ToggleLeft } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface QuestionFeedbackDetailProps {
  data: any;
  questionName: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d'];

export const QuestionFeedbackDetail: React.FC<QuestionFeedbackDetailProps> = ({ data, questionName }) => {
  const question = data?.question || {};
  const responses = data?.responses || [];
  const aggregated = data?.aggregated || {};
  
  if (!question || !question.question_name) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            Question data not available.
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderDistributionChart = () => {
    if (question.question_type === 'rating') {
      // Prepare data for rating questions
      const distributionData = aggregated.distribution || [];
      
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Response Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="value" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    if (question.question_type === 'boolean') {
      // Prepare data for boolean questions
      const booleanData = [
        { name: 'Yes', value: aggregated.distribution?.true_count || 0 },
        { name: 'No', value: aggregated.distribution?.false_count || 0 }
      ];
      
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Response Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={booleanData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {booleanData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };

  const renderTextResponses = () => {
    if (question.question_type === 'text' || question.question_type === 'comment') {
      const textResponses = aggregated.distribution || [];
      
      return (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="text-lg">Text Responses</CardTitle>
          </CardHeader>
          <CardContent>
            {textResponses.length > 0 ? (
              <div className="space-y-4">
                {textResponses.map((response: string, index: number) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-md">
                    {response}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-muted-foreground p-4">
                No text responses available.
              </div>
            )}
          </CardContent>
        </Card>
      );
    }
    
    return null;
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            {question.question_type === 'rating' && <BarChart4 className="h-5 w-5 text-blue-500" />}
            {question.question_type === 'boolean' && <ToggleLeft className="h-5 w-5 text-green-500" />}
            {(question.question_type === 'text' || question.question_type === 'comment') && 
              <MessageSquare className="h-5 w-5 text-purple-500" />
            }
            <CardTitle>{question.question_title || question.question_name}</CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {aggregated.response_count} responses / {data.team_size} team members
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="text-3xl font-bold text-center">
                  {data.response_rate || 0}%
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Response Rate
                </div>
              </CardContent>
            </Card>
            
            {question.question_type === 'rating' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-center">
                    {aggregated.average?.toFixed(1) || 'N/A'}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Average Rating
                  </div>
                </CardContent>
              </Card>
            )}
            
            {question.question_type === 'boolean' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-center">
                    {aggregated.distribution?.true_count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    Yes Responses
                  </div>
                </CardContent>
              </Card>
            )}
            
            {question.question_type === 'boolean' && (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-3xl font-bold text-center">
                    {aggregated.distribution?.false_count || 0}
                  </div>
                  <div className="text-sm text-muted-foreground text-center">
                    No Responses
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>
      
      {renderDistributionChart()}
      {renderTextResponses()}
      
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Response Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {responses.length > 0 ? (
              responses.map((response: any, index: number) => (
                <div key={index} className="border-b pb-2">
                  <div className="text-sm text-muted-foreground">
                    Submitted at {formatDate(response.submitted_at)}
                  </div>
                  <div className="font-medium">
                    Response: {response.value}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-muted-foreground p-4">
                No response data available.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
