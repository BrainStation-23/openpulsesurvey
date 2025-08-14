
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Survey as SurveyComponent } from "survey-react-ui";
import { Model } from "survey-core";
import { LayeredDarkPanelless } from "survey-core/themes";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Code } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Survey } from "../types";
import { useState } from "react";
import "survey-core/defaultV2.min.css";

export default function PreviewSurveyPage() {
  const { id } = useParams();
  const [viewMode, setViewMode] = useState<'interactive' | 'html'>('interactive');

  const { data: survey, isLoading } = useQuery({
    queryKey: ['surveys', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Survey;
    },
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!survey) {
    return <div>Survey not found</div>;
  }

  const surveyModel = new Model(survey.json_data);
  surveyModel.applyTheme(LayeredDarkPanelless);

  // Generate HTML representation for static view
  const generateSurveyHTML = () => {
    const pages = survey.json_data.pages || [];
    let html = `
      <div class="survey-preview">
        <div class="survey-header mb-6">
          <h1 class="text-2xl font-bold mb-2">${survey.json_data.title || survey.name}</h1>
          ${survey.json_data.description ? `<p class="text-gray-600 mb-4">${survey.json_data.description}</p>` : ''}
        </div>
    `;

    pages.forEach((page: any, pageIndex: number) => {
      html += `
        <div class="survey-page mb-8 p-6 border rounded-lg bg-white">
          ${page.title ? `<h2 class="text-xl font-semibold mb-4">Page ${pageIndex + 1}: ${page.title}</h2>` : `<h2 class="text-xl font-semibold mb-4">Page ${pageIndex + 1}</h2>`}
          <div class="questions-container space-y-4">
      `;

      (page.elements || []).forEach((element: any, questionIndex: number) => {
        html += `
          <div class="question-item p-4 border-l-4 border-blue-500 bg-gray-50">
            <div class="question-header mb-3">
              <h3 class="font-medium text-lg">${questionIndex + 1}. ${element.title}</h3>
              ${element.isRequired ? '<span class="text-red-500 text-sm">* Required</span>' : ''}
            </div>
            <div class="question-type text-sm text-gray-600 mb-2">
              Type: <span class="font-mono bg-gray-200 px-2 py-1 rounded">${element.type}</span>
            </div>
        `;

        // Add specific rendering based on question type
        switch (element.type) {
          case 'rating':
            const rateMax = element.rateMax || 5;
            const rateType = element.rateType || 'labels';
            html += `
              <div class="rating-preview">
                <p class="text-sm text-gray-600 mb-2">Rating scale: 1 to ${rateMax} (${rateType})</p>
                <div class="flex gap-2">
                  ${Array.from({length: rateMax}, (_, i) => `<div class="w-8 h-8 border border-gray-300 rounded flex items-center justify-center text-sm">${i + 1}</div>`).join('')}
                </div>
              </div>
            `;
            break;
          case 'boolean':
            html += `
              <div class="boolean-preview">
                <div class="flex gap-4">
                  <label class="flex items-center gap-2">
                    <input type="radio" name="q${questionIndex}" disabled>
                    <span>Yes</span>
                  </label>
                  <label class="flex items-center gap-2">
                    <input type="radio" name="q${questionIndex}" disabled>
                    <span>No</span>
                  </label>
                </div>
              </div>
            `;
            break;
          case 'text':
            html += `
              <div class="text-preview">
                <input type="text" class="w-full p-2 border border-gray-300 rounded" placeholder="Text input" disabled>
              </div>
            `;
            break;
          case 'comment':
            html += `
              <div class="comment-preview">
                <textarea class="w-full p-2 border border-gray-300 rounded h-24" placeholder="Long text input" disabled></textarea>
              </div>
            `;
            break;
          case 'dropdown':
          case 'radiogroup':
          case 'checkbox':
            if (element.choices) {
              html += `
                <div class="${element.type}-preview">
                  <div class="space-y-2">
                    ${element.choices.map((choice: any) => `
                      <label class="flex items-center gap-2">
                        <input type="${element.type === 'checkbox' ? 'checkbox' : 'radio'}" name="q${questionIndex}" disabled>
                        <span>${typeof choice === 'string' ? choice : choice.text || choice.value}</span>
                      </label>
                    `).join('')}
                  </div>
                </div>
              `;
            }
            break;
          default:
            html += `
              <div class="generic-preview">
                <p class="text-sm text-gray-500 italic">Preview not available for this question type</p>
              </div>
            `;
        }

        html += `</div>`;
      });

      html += `
          </div>
        </div>
      `;
    });

    html += `</div>`;
    return html;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin/surveys">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{survey.name}</h1>
          {survey.description && (
            <p className="text-muted-foreground">{survey.description}</p>
          )}
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'interactive' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('interactive')}
          >
            <Eye className="h-4 w-4 mr-2" />
            Interactive
          </Button>
          <Button
            variant={viewMode === 'html' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('html')}
          >
            <Code className="h-4 w-4 mr-2" />
            HTML View
          </Button>
        </div>
      </div>

      {viewMode === 'interactive' ? (
        <div className="bg-white rounded-lg shadow p-6">
          <SurveyComponent model={surveyModel} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div 
            className="survey-html-preview"
            dangerouslySetInnerHTML={{ __html: generateSurveyHTML() }}
          />
        </div>
      )}
    </div>
  );
}
