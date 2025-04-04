
import React, { useState } from 'react';
import { SurveyStructure } from '@/types/survey-builder';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PreviewQuestion } from './preview/PreviewQuestion';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SurveyPreviewProps {
  survey: SurveyStructure;
}

export const SurveyPreview: React.FC<SurveyPreviewProps> = ({ survey }) => {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});

  const handleAnswer = (questionId: string, value: any) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const canGoNext = currentPageIndex < survey.pages.length - 1;
  const canGoPrevious = currentPageIndex > 0;

  const goToNextPage = () => {
    if (canGoNext) {
      setCurrentPageIndex(prev => prev + 1);
    }
  };

  const goToPreviousPage = () => {
    if (canGoPrevious) {
      setCurrentPageIndex(prev => prev - 1);
    }
  };

  const currentPage = survey.pages[currentPageIndex];

  // Check if all required questions on current page are answered
  const areRequiredQuestionsAnswered = () => {
    return currentPage.questions
      .filter(q => q.isRequired)
      .every(q => answers[q.id] !== undefined && answers[q.id] !== '');
  };

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          {survey.logo && (
            <img 
              src={survey.logo} 
              alt="Survey Logo" 
              className={`h-10 ${survey.logoPosition === 'right' ? 'ml-auto' : ''}`} 
            />
          )}
          {survey.logoPosition === 'left' && <div></div>}
        </div>
        <CardTitle>{survey.title}</CardTitle>
        {survey.description && (
          <CardDescription>{survey.description}</CardDescription>
        )}
      </CardHeader>
      
      {survey.showProgressBar && (
        <div className="px-6">
          <div className="w-full bg-muted rounded-full h-2.5">
            <div 
              className="bg-primary h-2.5 rounded-full" 
              style={{ width: `${((currentPageIndex + 1) / survey.pages.length) * 100}%` }} 
            ></div>
          </div>
          <div className="text-xs text-muted-foreground text-right mt-1">
            Page {currentPageIndex + 1} of {survey.pages.length}
          </div>
        </div>
      )}
      
      <CardContent className="py-4">
        {currentPage && (
          <div>
            {currentPage.title && (
              <h3 className="text-lg font-medium mb-2">{currentPage.title}</h3>
            )}
            
            {currentPage.description && (
              <p className="text-muted-foreground mb-4">{currentPage.description}</p>
            )}
            
            <div className="space-y-6">
              {currentPage.questions.map(question => (
                <PreviewQuestion
                  key={question.id}
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) => handleAnswer(question.id, value)}
                />
              ))}
            </div>
            
            <div className="flex justify-between mt-8">
              {canGoPrevious ? (
                <Button 
                  variant="outline" 
                  onClick={goToPreviousPage}
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>
              ) : <div></div>}
              
              {canGoNext ? (
                <Button 
                  onClick={goToNextPage}
                  disabled={!areRequiredQuestionsAnswered()}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  disabled={!areRequiredQuestionsAnswered()}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
