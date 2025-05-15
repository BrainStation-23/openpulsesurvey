
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReporteeFeedback } from '@/hooks/useReporteeFeedback';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertCircle, MessageSquare, AlertTriangle, PieChart, Users } from 'lucide-react';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

export default function ReporteeFeedbackPage() {
  const { user } = useCurrentUser();
  const { feedbackData, isLoading, error } = useReporteeFeedback();

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Reportee Feedback</h1>
        </div>
        <Card>
          <CardContent className="p-6 flex justify-center items-center min-h-[300px]">
            <LoadingSpinner size="lg" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Reportee Feedback</h1>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load feedback data: {error.message}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!feedbackData || feedbackData.status !== 'success' || !feedbackData.data) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Reportee Feedback</h1>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Reportee Feedback</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">
              This page allows you to view and manage feedback for your direct reportees.
              You can analyze responses, track progress, and identify areas for improvement.
            </p>
            
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <MessageSquare className="h-10 w-10 text-primary" />
              </div>
              <h3 className="text-xl font-medium mb-2">No feedback data available</h3>
              <p className="text-muted-foreground max-w-md">
                Feedback data will appear here once your reportees have received and responded to feedback requests.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Prepare data for the overview
  const { team_size, response_count, response_rate, questions } = feedbackData.data;

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Reportee Feedback</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <Users className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Team Size</p>
            <p className="text-3xl font-bold">{team_size}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <MessageSquare className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Responses</p>
            <p className="text-3xl font-bold">{response_count}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4 flex flex-col items-center justify-center h-full">
            <PieChart className="h-8 w-8 text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Response Rate</p>
            <p className="text-3xl font-bold">{response_rate}%</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Questions Summary</CardTitle>
          <CardDescription>
            Overview of all feedback questions from your team members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="questions">
            <TabsList>
              <TabsTrigger value="questions">Questions</TabsTrigger>
              <TabsTrigger value="visualizations">Visualizations</TabsTrigger>
            </TabsList>
            <TabsContent value="questions" className="space-y-6">
              {questions.length === 0 ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>No questions found</AlertTitle>
                  <AlertDescription>
                    There are no feedback questions available to display.
                  </AlertDescription>
                </Alert>
              ) : (
                questions.map((question) => (
                  <Card key={question.question_name} className="overflow-hidden">
                    <CardHeader className="bg-muted p-4">
                      <CardTitle className="text-base">{question.question_title}</CardTitle>
                      <CardDescription>Type: {question.question_type} | Responses: {question.response_count}</CardDescription>
                    </CardHeader>
                    <CardContent className="p-4">
                      {question.question_type === 'rating' && question.avg_value !== null && (
                        <div className="flex items-center">
                          <span className="text-2xl font-semibold mr-2">{question.avg_value.toFixed(1)}</span>
                          <span className="text-sm text-muted-foreground">Average Rating</span>
                        </div>
                      )}
                      
                      {question.question_type === 'boolean' && question.distribution && (
                        <div className="flex items-center gap-4">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                            <span className="text-sm">{question.distribution.true_count || 0} Yes</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                            <span className="text-sm">{question.distribution.false_count || 0} No</span>
                          </div>
                        </div>
                      )}
                      
                      {question.question_type === 'text' && question.distribution && (
                        <div>
                          <p className="text-sm text-muted-foreground mb-2">Text Responses: {Array.isArray(question.distribution) ? question.distribution.length : 0}</p>
                          {Array.isArray(question.distribution) && question.distribution.length > 0 && (
                            <Button variant="outline" size="sm">View Text Responses</Button>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
            <TabsContent value="visualizations">
              <div className="space-y-8">
                {questions
                  .filter(q => q.question_type === 'rating' && q.distribution)
                  .map((question) => (
                    <div key={question.question_name} className="space-y-2">
                      <h3 className="text-lg font-medium">{question.question_title}</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={question.distribution.map((item: any) => ({
                              value: item.value,
                              count: item.count
                            }))}
                            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="value" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="count" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
                
                {questions
                  .filter(q => q.question_type === 'boolean' && q.distribution)
                  .map((question) => (
                    <div key={question.question_name} className="space-y-2">
                      <h3 className="text-lg font-medium">{question.question_title}</h3>
                      <div className="h-64 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { name: 'Yes', value: question.distribution.true_count || 0 },
                              { name: 'No', value: question.distribution.false_count || 0 }
                            ]}
                            margin={{ top: 10, right: 30, left: 0, bottom: 5 }}
                          >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Bar dataKey="value" fill="#8884d8" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
