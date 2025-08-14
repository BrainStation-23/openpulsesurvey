
import React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  Heading1, 
  Heading2, 
  Heading3,
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link, 
  Eye, 
  Edit,
  Type
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";

interface RichMarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function RichMarkdownEditor({ 
  value, 
  onChange, 
  placeholder = "Enter markdown content...",
  className = "" 
}: RichMarkdownEditorProps) {
  const [showPreview, setShowPreview] = React.useState(true);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = "", placeholder: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    
    onChange(newText);
    
    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const insertAtLine = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const beforeCursor = value.substring(0, start);
    const afterCursor = value.substring(start);
    
    // Find the start of the current line
    const lineStart = beforeCursor.lastIndexOf('\n') + 1;
    const currentLine = beforeCursor.substring(lineStart);
    
    // Insert the prefix at the beginning of the line
    const newText = beforeCursor.substring(0, lineStart) + prefix + currentLine + afterCursor;
    onChange(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length);
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertText("**", "**", "bold text"),
    },
    {
      icon: Italic,
      label: "Italic", 
      action: () => insertText("*", "*", "italic text"),
    },
    {
      icon: Strikethrough,
      label: "Strikethrough",
      action: () => insertText("~~", "~~", "strikethrough text"),
    },
    {
      icon: Heading1,
      label: "Heading 1",
      action: () => insertAtLine("# "),
    },
    {
      icon: Heading2,
      label: "Heading 2", 
      action: () => insertAtLine("## "),
    },
    {
      icon: Heading3,
      label: "Heading 3",
      action: () => insertAtLine("### "),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertAtLine("- "),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertAtLine("1. "),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => insertAtLine("> "),
    },
    {
      icon: Code,
      label: "Code",
      action: () => insertText("`", "`", "code"),
    },
    {
      icon: Link,
      label: "Link",
      action: () => insertText("[", "](url)", "link text"),
    },
  ];

  return (
    <div className={`border rounded-lg overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b bg-muted/50">
        <div className="flex items-center gap-1 flex-wrap">
          {toolbarButtons.map((button, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={button.action}
              title={button.label}
              className="h-8 w-8 p-0"
            >
              <button.icon className="h-3.5 w-3.5" />
            </Button>
          ))}
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={!showPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowPreview(false)}
            className="h-8"
          >
            <Edit className="h-3.5 w-3.5 mr-1" />
            Edit
          </Button>
          <Button
            type="button"
            variant={showPreview ? "default" : "ghost"}
            size="sm"
            onClick={() => setShowPreview(true)}
            className="h-8"
          >
            <Eye className="h-3.5 w-3.5 mr-1" />
            Preview
          </Button>
        </div>
      </div>

      {/* Editor Content */}
      <div className="h-80">
        {showPreview ? (
          <ResizablePanelGroup direction="horizontal" className="h-full">
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full p-0">
                <Textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  placeholder={placeholder}
                  className="h-full resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
            </ResizablePanel>
            
            <ResizableHandle withHandle />
            
            <ResizablePanel defaultSize={50} minSize={30}>
              <div className="h-full p-4 overflow-auto bg-background">
                {value ? (
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <ReactMarkdown>{value}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="text-muted-foreground text-sm flex items-center justify-center h-full">
                    <div className="text-center">
                      <Type className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>Preview will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <Textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="h-full resize-none border-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        )}
      </div>
    </div>
  );
}
