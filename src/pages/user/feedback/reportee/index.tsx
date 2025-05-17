
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { useReporteeFeedback, TeamFeedbackQuestion } from '@/hooks/useReporteeFeedback';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { CampaignSelector } from './components/CampaignSelector';
import { InstanceSelector } from './components/InstanceSelector';
import { FeedbackOverview } from './components/FeedbackOverview';
import { EnhancedQuestionCard } from './components/EnhancedQuestionCard';
import { QuestionComparisonTable } from './components/QuestionComparisonTable';
import { TextResponsesViewer } from './components/TextResponsesViewer';
import { useFeedbackAnalytics } from '@/hooks/useFeedbackAnalytics';
import { AlertCircle, Search, Filter, Download, TableIcon, Grid } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function ReporteeFeedbackPage() {
  const { user } = useCurrentUser();
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | undefined>();
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | undefined>();
  const [viewType, setViewType] = useState<'cards' | 'table'>('cards');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedQuestionType, setSelectedQuestionType] = useState<string>('all');
  const [selectedTextQuestion, setSelectedTextQuestion] = useState<TeamFeedbackQuestion | null>(null);
  const { toast } = useToast();
  const analytics = useFeedbackAnalytics();
  
  const { 
    feedbackData, 
    isLoading, 
    error,
    refetch
  } = useReporteeFeedback(selectedCampaignId, selectedInstanceId);

  // Log page load
  useEffect(() => {
    analytics.logEvent('page_view', { page: 'reportee_feedback' });
    
    // Measure initial loading performance
    const startTime = performance.now();
    
    return () => {
      const loadTime = performance.now() - startTime;
      analytics.logPerformanceMetric('page_load', loadTime);
    };
  }, []);
  
  // Log campaign/instance selection
  useEffect(() => {
    if (selectedCampaignId) {
      analytics.logFilterChange('campaign', selectedCampaignId);
    }
    if (selectedInstanceId) {
      analytics.logFilterChange('instance', selectedInstanceId);
    }
  }, [selectedCampaignId, selectedInstanceId]);

  const handleCampaignSelect = (campaignId: string) => {
    setSelectedCampaignId(campaignId);
    setSelectedInstanceId(undefined);
    analytics.logEvent('campaign_selected', { campaignId });
  };

  const handleInstanceSelect = (instanceId: string) => {
    setSelectedInstanceId(instanceId);
    analytics.logEvent('instance_selected', { instanceId });
  };
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    
    // Don't log every keystroke, maybe add debounce in real implementation
    if (e.target.value.length > 2 || e.target.value === '') {
      analytics.logSearch(e.target.value, 0); // Count would be calculated after filtering
    }
  };
  
  const handleQuestionTypeChange = (type: string) => {
    setSelectedQuestionType(type);
    analytics.logFilterChange('question_type', type);
  };
  
  const handleViewDetails = (question: TeamFeedbackQuestion) => {
    if (question.question_type === 'text') {
      setSelectedTextQuestion(question);
      analytics.logQuestionView(question.question_name, question.question_title);
    } else {
      // For other question types, we could show a modal with detailed analytics
      // or navigate to a detail page
      toast({
        title: "Coming soon",
        description: "Detailed view for this question type is coming soon.",
      });
    }
  };
  
  const handleExportAll = () => {
    analytics.logEvent('export_all', { format: 'csv' });
    
    toast({
      title: "Exporting all data",
      description: "Your data export is being prepared and will download shortly.",
    });
    
    // In a real implementation, this would trigger the actual export
  };

  // Filter questions based on search and type filter
  const filteredQuestions = feedbackData?.data?.questions?.filter(q => {
    const matchesSearch = searchQuery === '' || 
      q.question_title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = selectedQuestionType === 'all' || 
      q.question_type === selectedQuestionType;
    
    return matchesSearch && matchesType;
  }) || [];

  if (isLoading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex flex-col space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Reportee Feedback</h1>
          <p className="text-muted-foreground">
            View and analyze feedback from your team members
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="w-[280px] h-10 bg-gray-200 animate-pulse rounded-md"></div>
          <div className="w-[280px] h-10 bg-gray-200 animate-pulse rounded-md"></div>
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
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <CampaignSelector 
                selectedCampaignId={selectedCampaignId}
                onCampaignSelect={handleCampaignSelect}
              />
              {selectedCampaignId && (
                <InstanceSelector 
                  campaignId={selectedCampaignId}
                  selectedInstanceId={selectedInstanceId}
                  onInstanceSelect={handleInstanceSelect}
                />
              )}
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <p className="text-muted-foreground mb-4">
              This page allows you to view and manage feedback for your direct reportees.
              You can analyze responses, track progress, and identify areas for improvement.
            </p>
            
            <div className="p-8 flex flex-col items-center justify-center text-center">
              <div className="rounded-full bg-primary/10 p-6 mb-4">
                <AlertCircle className="h-10 w-10 text-primary" />
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

  // Show text responses viewer if a text question is selected
  if (selectedTextQuestion) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight">Reportee Feedback</h1>
          <Button 
            variant="outline" 
            onClick={() => setSelectedTextQuestion(null)}
          >
            Back to Questions
          </Button>
        </div>
        
        <TextResponsesViewer 
          questionTitle={selectedTextQuestion.question_title}
          responses={Array.isArray(selectedTextQuestion.distribution) 
            ? selectedTextQuestion.distribution 
            : []}
          onClose={() => setSelectedTextQuestion(null)}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Reportee Feedback</h1>
        <p className="text-muted-foreground">
          View and analyze feedback from your team members
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <CampaignSelector 
          selectedCampaignId={selectedCampaignId}
          onCampaignSelect={handleCampaignSelect}
        />
        {selectedCampaignId && (
          <InstanceSelector 
            campaignId={selectedCampaignId}
            selectedInstanceId={selectedInstanceId}
            onInstanceSelect={handleInstanceSelect}
          />
        )}
      </div>

      {feedbackData.data && (
        <FeedbackOverview 
          data={feedbackData.data} 
          isLoading={isLoading} 
        />
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Feedback Questions</CardTitle>
              <CardDescription>
                Analysis of all feedback questions from your team members
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative flex-1 md:w-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  className="pl-8 w-full md:w-[200px]"
                  value={searchQuery}
                  onChange={handleSearch}
                />
              </div>
              
              <div className="flex items-center rounded-md border">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-l-md ${viewType === 'cards' ? 'bg-muted' : ''}`}
                  onClick={() => setViewType('cards')}
                >
                  <Grid className="h-4 w-4 mr-2" />
                  Cards
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`rounded-r-md ${viewType === 'table' ? 'bg-muted' : ''}`}
                  onClick={() => setViewType('table')}
                >
                  <TableIcon className="h-4 w-4 mr-2" />
                  Table
                </Button>
              </div>
              
              <Button variant="outline" size="sm" onClick={handleExportAll}>
                <Download className="h-4 w-4 mr-2" />
                Export All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" onValueChange={handleQuestionTypeChange}>
            <div className="mb-6">
              <TabsList>
                <TabsTrigger value="all">All Questions</TabsTrigger>
                <TabsTrigger value="rating">Rating</TabsTrigger>
                <TabsTrigger value="boolean">Yes/No</TabsTrigger>
                <TabsTrigger value="text">Text</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="space-y-0">
              {viewType === 'table' ? (
                <QuestionComparisonTable questions={filteredQuestions} />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredQuestions.map((question) => (
                    <EnhancedQuestionCard 
                      key={question.question_name}
                      question={question}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="rating" className="space-y-0">
              {viewType === 'table' ? (
                <QuestionComparisonTable 
                  questions={filteredQuestions.filter(q => q.question_type === 'rating')} 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredQuestions
                    .filter(q => q.question_type === 'rating')
                    .map((question) => (
                      <EnhancedQuestionCard 
                        key={question.question_name}
                        question={question}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="boolean" className="space-y-0">
              {viewType === 'table' ? (
                <QuestionComparisonTable 
                  questions={filteredQuestions.filter(q => q.question_type === 'boolean')} 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredQuestions
                    .filter(q => q.question_type === 'boolean')
                    .map((question) => (
                      <EnhancedQuestionCard 
                        key={question.question_name}
                        question={question}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="text" className="space-y-0">
              {viewType === 'table' ? (
                <QuestionComparisonTable 
                  questions={filteredQuestions.filter(q => q.question_type === 'text')} 
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredQuestions
                    .filter(q => q.question_type === 'text')
                    .map((question) => (
                      <EnhancedQuestionCard 
                        key={question.question_name}
                        question={question}
                        onViewDetails={handleViewDetails}
                      />
                    ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
          
          {filteredQuestions.length === 0 && (
            <div className="py-12 text-center">
              <div className="rounded-full bg-muted w-12 h-12 mx-auto flex items-center justify-center mb-4">
                <Search className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No questions found</h3>
              <p className="text-muted-foreground">
                {searchQuery ? 
                  `No questions match "${searchQuery}"` : 
                  `No ${selectedQuestionType !== 'all' ? selectedQuestionType : ''} questions available`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
