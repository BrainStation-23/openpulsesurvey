
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { Button } from "@/components/ui/button";
import { Bold, Italic, List, ListOrdered, Quote, Undo, Redo, Send } from "lucide-react";
import type { EmailResponse } from "../../types";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

interface EmailEditorProps {
  onSubmit: (response: EmailResponse) => Promise<void>;
  isSubmitting?: boolean;
  disabled?: boolean;
}

export function EmailEditor({ onSubmit, isSubmitting = false, disabled = false }: EmailEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Type your response here...',
        emptyEditorClass: 'is-editor-empty',
      }),
    ],
    content: "",
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none",
      },
    },
  });

  const handleSubmit = async () => {
    if (!editor || disabled || isSubmitting) return;
    
    const response: EmailResponse = {
      subject: "Re: Response",
      content: editor.getHTML(),
    };

    await onSubmit(response);
  };

  if (!editor) return null;

  return (
    <div className="bg-background">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2 p-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            data-active={editor.isActive('bold')}
            className="data-[active=true]:bg-accent"
            disabled={disabled}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            data-active={editor.isActive('italic')}
            className="data-[active=true]:bg-accent"
            disabled={disabled}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            data-active={editor.isActive('bulletList')}
            className="data-[active=true]:bg-accent"
            disabled={disabled}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            data-active={editor.isActive('orderedList')}
            className="data-[active=true]:bg-accent"
            disabled={disabled}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            data-active={editor.isActive('blockquote')}
            className="data-[active=true]:bg-accent"
            disabled={disabled}
          >
            <Quote className="h-4 w-4" />
          </Button>
          <div className="ml-auto flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().undo().run()}
              disabled={disabled}
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => editor.chain().focus().redo().run()}
              disabled={disabled}
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        .is-editor-empty:first-child::before {
          color: #adb5bd;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>

      <div className="p-4">
        <div className="min-h-[200px] border border-input rounded-md bg-transparent p-4">
          <EditorContent editor={editor} />
        </div>
      </div>
      
      <div className="border-t p-4 bg-background">
        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit} 
            className="gap-2"
            disabled={disabled || isSubmitting}
          >
            {isSubmitting ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Send Response
          </Button>
        </div>
      </div>
    </div>
  );
}
