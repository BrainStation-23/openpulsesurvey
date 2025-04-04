
import React, { useState } from 'react';
import { SurveyStructure, SurveyPage, Question } from '@/types/survey-builder';
import { ToolboxPanel } from './ToolboxPanel';
import { DesignSurface } from './DesignSurface';
import { PropertyPanel } from './PropertyPanel';
import { SurveyPreview } from './SurveyPreview';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { generateId } from './utils';

interface SurveyBuilderProps {
  initialSurvey?: SurveyStructure;
  onSave: (survey: SurveyStructure) => void;
}

export const SurveyBuilder: React.FC<SurveyBuilderProps> = ({
  initialSurvey,
  onSave
}) => {
  const [survey, setSurvey] = useState<SurveyStructure>(initialSurvey || {
    title: 'New Survey',
    description: '',
    pages: [
      {
        id: generateId(),
        title: 'Page 1',
        questions: []
      }
    ],
    showProgressBar: true,
    logoPosition: 'right'
  });

  const [activePageIndex, setActivePageIndex] = useState(0);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'design' | 'preview'>('design');

  const addQuestion = (questionType: Question['type']) => {
    const newQuestion: Question = {
      id: generateId(),
      type: questionType,
      title: `New ${questionType} question`,
      isRequired: false
    };

    // Add specific properties based on question type
    if (questionType === 'rating') {
      (newQuestion as any).rateMax = 5;
      (newQuestion as any).rateType = 'stars';
    } else if (questionType === 'boolean') {
      (newQuestion as any).labelTrue = 'Yes';
      (newQuestion as any).labelFalse = 'No';
    } else if (questionType === 'text' || questionType === 'comment') {
      (newQuestion as any).placeholder = 'Enter your answer here...';
    }

    setSurvey(prev => {
      const newPages = [...prev.pages];
      newPages[activePageIndex] = {
        ...newPages[activePageIndex],
        questions: [...newPages[activePageIndex].questions, newQuestion]
      };
      return { ...prev, pages: newPages };
    });

    setSelectedQuestionId(newQuestion.id);
  };

  const updateQuestion = (questionId: string, updates: Partial<Question>) => {
    setSurvey(prev => {
      const newPages = [...prev.pages];
      const pageIndex = newPages.findIndex(page => 
        page.questions.some(q => q.id === questionId)
      );
      
      if (pageIndex !== -1) {
        const questionIndex = newPages[pageIndex].questions.findIndex(q => q.id === questionId);
        
        if (questionIndex !== -1) {
          newPages[pageIndex].questions[questionIndex] = {
            ...newPages[pageIndex].questions[questionIndex],
            ...updates
          };
        }
      }
      
      return { ...prev, pages: newPages };
    });
  };

  const updateSurveySettings = (updates: Partial<SurveyStructure>) => {
    setSurvey(prev => ({ ...prev, ...updates }));
  };

  const updatePage = (pageIndex: number, updates: Partial<SurveyPage>) => {
    setSurvey(prev => {
      const newPages = [...prev.pages];
      newPages[pageIndex] = { ...newPages[pageIndex], ...updates };
      return { ...prev, pages: newPages };
    });
  };

  const addPage = () => {
    setSurvey(prev => ({
      ...prev,
      pages: [
        ...prev.pages,
        {
          id: generateId(),
          title: `Page ${prev.pages.length + 1}`,
          questions: []
        }
      ]
    }));
    setActivePageIndex(survey.pages.length);
  };

  const deletePage = (pageIndex: number) => {
    if (survey.pages.length <= 1) return;
    
    setSurvey(prev => {
      const newPages = prev.pages.filter((_, index) => index !== pageIndex);
      return { ...prev, pages: newPages };
    });
    
    if (activePageIndex >= pageIndex && activePageIndex > 0) {
      setActivePageIndex(activePageIndex - 1);
    }
  };

  const deleteQuestion = (questionId: string) => {
    setSurvey(prev => {
      const newPages = [...prev.pages];
      const pageIndex = newPages.findIndex(page => 
        page.questions.some(q => q.id === questionId)
      );
      
      if (pageIndex !== -1) {
        newPages[pageIndex] = {
          ...newPages[pageIndex],
          questions: newPages[pageIndex].questions.filter(q => q.id !== questionId)
        };
      }
      
      return { ...prev, pages: newPages };
    });
    
    if (selectedQuestionId === questionId) {
      setSelectedQuestionId(null);
    }
  };

  const handleSave = () => {
    onSave(survey);
  };

  const getSelectedQuestion = (): Question | null => {
    if (!selectedQuestionId) return null;
    
    for (const page of survey.pages) {
      const question = page.questions.find(q => q.id === selectedQuestionId);
      if (question) return question;
    }
    
    return null;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between mb-4">
        <h2 className="text-2xl font-bold">Survey Builder</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setActiveTab('design')}>
            Design
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('preview')}>
            Preview
          </Button>
          <Button onClick={handleSave}>
            Save Survey
          </Button>
        </div>
      </div>

      {activeTab === 'design' ? (
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-3">
            <ToolboxPanel onAddQuestion={addQuestion} />
          </div>
          <div className="col-span-6">
            <DesignSurface
              survey={survey}
              activePageIndex={activePageIndex}
              selectedQuestionId={selectedQuestionId}
              onSelectQuestion={setSelectedQuestionId}
              onUpdatePage={updatePage}
              onDeleteQuestion={deleteQuestion}
              onAddPage={addPage}
              onDeletePage={deletePage}
              onChangeActivePage={setActivePageIndex}
            />
          </div>
          <div className="col-span-3">
            <PropertyPanel
              survey={survey}
              selectedQuestion={getSelectedQuestion()}
              onUpdateQuestion={updateQuestion}
              onUpdateSurvey={updateSurveySettings}
            />
          </div>
        </div>
      ) : (
        <SurveyPreview survey={survey} />
      )}
    </div>
  );
};
