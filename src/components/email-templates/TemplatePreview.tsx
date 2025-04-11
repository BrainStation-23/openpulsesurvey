
import { useState, useEffect } from 'react';
import { TemplateVariable } from '@/types/emailTemplates';

interface TemplatePreviewProps {
  html: string;
  subject: string;
  variables: TemplateVariable[];
}

export default function TemplatePreview({ html, subject, variables }: TemplatePreviewProps) {
  const [previewHtml, setPreviewHtml] = useState(html);
  const [previewSubject, setPreviewSubject] = useState(subject);
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});

  useEffect(() => {
    // Initialize variable values with sample or default values
    const initialValues: Record<string, string> = {};
    variables.forEach(variable => {
      initialValues[variable.name] = variable.sample_value || variable.default_value || '';
    });
    setVariableValues(initialValues);
  }, [variables]);

  useEffect(() => {
    // Apply variable replacements to HTML
    let processedHtml = html;
    let processedSubject = subject;
    
    Object.entries(variableValues).forEach(([name, value]) => {
      const regex = new RegExp(`{{${name}}}`, 'g');
      processedHtml = processedHtml.replace(regex, value);
      processedSubject = processedSubject.replace(regex, value);
    });
    
    setPreviewHtml(processedHtml);
    setPreviewSubject(processedSubject);
  }, [html, subject, variableValues]);

  const handleVariableChange = (name: string, value: string) => {
    setVariableValues(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="space-y-4">
      {variables.length > 0 && (
        <div className="bg-white p-4 border rounded-md shadow-sm">
          <h3 className="text-sm font-medium mb-3">Preview with variables:</h3>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {variables.map(variable => (
              <div key={variable.id} className="flex flex-col">
                <label className="text-xs font-medium text-muted-foreground mb-1">
                  {variable.name}
                </label>
                <input
                  type="text"
                  className="border rounded-md px-2 py-1 text-sm"
                  value={variableValues[variable.name] || ''}
                  onChange={(e) => handleVariableChange(variable.name, e.target.value)}
                  placeholder={variable.sample_value || variable.default_value || ''}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white border rounded-md shadow-sm overflow-hidden">
        <div className="border-b p-3 bg-muted/20">
          <div className="text-sm font-medium">Subject: {previewSubject}</div>
        </div>
        <div className="p-4">
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </div>
    </div>
  );
}
