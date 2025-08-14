
import React from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Eye, Edit } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Enter markdown content...",
  rows = 4 
}: MarkdownEditorProps) {
  const [isPreview, setIsPreview] = React.useState(false);

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            type="button"
            variant={!isPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreview(false)}
          >
            <Edit className="h-3 w-3 mr-1" />
            Edit
          </Button>
          <Button
            type="button"
            variant={isPreview ? "default" : "outline"}
            size="sm"
            onClick={() => setIsPreview(true)}
          >
            <Eye className="h-3 w-3 mr-1" />
            Preview
          </Button>
        </div>
      </div>
      
      {isPreview ? (
        <div className="min-h-[100px] p-3 border rounded-md bg-background">
          {value ? (
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{value}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">Nothing to preview</p>
          )}
        </div>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
        />
      )}
    </div>
  );
}
