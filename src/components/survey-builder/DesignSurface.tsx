
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SurveyStructure, SurveyPage, Question } from '@/types/survey-builder';
import { QuestionItem } from './QuestionItem';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash } from 'lucide-react';

interface DesignSurfaceProps {
  survey: SurveyStructure;
  activePageIndex: number;
  selectedQuestionId: string | null;
  onSelectQuestion: (id: string | null) => void;
  onUpdatePage: (pageIndex: number, updates: Partial<SurveyPage>) => void;
  onDeleteQuestion: (id: string) => void;
  onAddPage: () => void;
  onDeletePage: (pageIndex: number) => void;
  onChangeActivePage: (pageIndex: number) => void;
}

export const DesignSurface: React.FC<DesignSurfaceProps> = ({
  survey,
  activePageIndex,
  selectedQuestionId,
  onSelectQuestion,
  onUpdatePage,
  onDeleteQuestion,
  onAddPage,
  onDeletePage,
  onChangeActivePage
}) => {
  const activePage = survey.pages[activePageIndex];

  const handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onUpdatePage(activePageIndex, { title: event.target.value });
  };

  const handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    onUpdatePage(activePageIndex, { description: event.target.value });
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Design Surface</CardTitle>
          <CardDescription>Build your survey by adding and configuring questions</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs 
          value={String(activePageIndex)}
          onValueChange={(value) => onChangeActivePage(parseInt(value))}
          className="w-full"
        >
          <div className="flex items-center mb-4">
            <TabsList className="flex-grow overflow-x-auto">
              {survey.pages.map((page, index) => (
                <TabsTrigger key={page.id} value={String(index)}>
                  {page.title || `Page ${index + 1}`}
                </TabsTrigger>
              ))}
            </TabsList>
            <Button variant="ghost" size="icon" onClick={onAddPage} className="ml-2">
              <Plus className="h-4 w-4" />
            </Button>
            {survey.pages.length > 1 && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => onDeletePage(activePageIndex)}
                className="ml-1"
              >
                <Trash className="h-4 w-4" />
              </Button>
            )}
          </div>

          {survey.pages.map((page, index) => (
            <TabsContent key={page.id} value={String(index)} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Page Title</label>
                <Input
                  value={page.title || ''}
                  onChange={handleTitleChange}
                  placeholder="Enter page title"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Page Description</label>
                <Textarea
                  value={page.description || ''}
                  onChange={handleDescriptionChange}
                  placeholder="Enter page description"
                  rows={2}
                />
              </div>

              <div className="border rounded-md p-4 min-h-[300px] bg-muted/20">
                {page.questions.map((question) => (
                  <QuestionItem
                    key={question.id}
                    question={question}
                    isSelected={question.id === selectedQuestionId}
                    onSelect={onSelectQuestion}
                    onDelete={onDeleteQuestion}
                  />
                ))}

                {page.questions.length === 0 && (
                  <div className="flex items-center justify-center h-32 text-muted-foreground">
                    Add questions from the left panel
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};
