
import { useRef, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TemplateVariable } from '@/types/emailTemplates';

interface HtmlEditorProps {
  value: string;
  onChange: (value: string) => void;
  variables: TemplateVariable[];
}

export default function HtmlEditor({ value, onChange, variables }: HtmlEditorProps) {
  const editorRef = useRef<any>(null);
  const [editorHeight, setEditorHeight] = useState<number>(500);

  const insertVariable = (variable: TemplateVariable) => {
    if (editorRef.current) {
      editorRef.current.insertContent(`{{${variable.name}}}`);
    }
  };

  return (
    <div className="border rounded-md">
      <div className="p-2 border-b flex justify-between items-center bg-muted/20">
        <div className="text-sm font-medium">HTML Content</div>
        <div className="flex items-center space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Insert Variable
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {variables.length > 0 ? (
                variables.map((variable) => (
                  <DropdownMenuItem
                    key={variable.id}
                    onClick={() => insertVariable(variable)}
                  >
                    {variable.name}
                    {variable.description && (
                      <span className="ml-2 text-muted-foreground text-xs">
                        ({variable.description})
                      </span>
                    )}
                  </DropdownMenuItem>
                ))
              ) : (
                <DropdownMenuItem disabled>
                  No variables available
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Editor
        apiKey="no-api-key"
        onInit={(evt, editor) => {
          editorRef.current = editor;
        }}
        initialValue={value}
        onEditorChange={(newValue) => onChange(newValue)}
        init={{
          height: editorHeight,
          menubar: true,
          plugins: [
            'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
            'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
            'insertdatetime', 'media', 'table', 'code', 'help', 'wordcount'
          ],
          toolbar: 'undo redo | blocks | ' +
            'bold italic forecolor | alignleft aligncenter ' +
            'alignright alignjustify | bullist numlist outdent indent | ' +
            'removeformat | help',
          content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }',
          resize: true,
          resize_callback: (width, height) => {
            setEditorHeight(height);
          }
        }}
      />
    </div>
  );
}
