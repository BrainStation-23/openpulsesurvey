import React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import { Button } from "@/components/ui/button";
import { 
  Bold, 
  Italic, 
  Strikethrough, 
  List, 
  ListOrdered, 
  Quote, 
  Code, 
  Link as LinkIcon,
  Heading1,
  Heading2,
  Heading3,
  CheckSquare
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  className?: string;
}

export function TiptapEditor({ 
  content, 
  onChange, 
  placeholder = "Start writing...",
  className 
}: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:text-primary/80',
        },
      }),
      TaskList.configure({
        HTMLAttributes: {
          class: 'not-prose',
        },
      }),
      TaskItem.configure({
        nested: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none p-4 min-h-[300px]',
      },
    },
  });

  React.useEffect(() => {
    if (editor && editor.getHTML() !== content) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const ToolbarButton = ({ 
    onClick, 
    isActive, 
    children, 
    title 
  }: { 
    onClick: () => void; 
    isActive?: boolean; 
    children: React.ReactNode;
    title: string;
  }) => (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      className={cn(
        "h-8 w-8 p-0 hover:bg-accent hover:text-accent-foreground",
        isActive && "bg-accent text-accent-foreground"
      )}
      title={title}
    >
      {children}
    </Button>
  );

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
          .ProseMirror {
            outline: none !important;
          }
          
          .ProseMirror h1 {
            font-size: 1.875rem;
            font-weight: 700;
            line-height: 2.25rem;
            margin: 1.5rem 0 0.75rem 0;
          }
          
          .ProseMirror h2 {
            font-size: 1.5rem;
            font-weight: 600;
            line-height: 2rem;
            margin: 1.25rem 0 0.5rem 0;
          }
          
          .ProseMirror h3 {
            font-size: 1.25rem;
            font-weight: 600;
            line-height: 1.75rem;
            margin: 1rem 0 0.5rem 0;
          }
          
          .ProseMirror ul {
            padding-left: 1.5rem;
            margin: 0.5rem 0;
            list-style-type: disc;
          }
          
          .ProseMirror ol {
            padding-left: 1.5rem;
            margin: 0.5rem 0;
            list-style-type: decimal;
          }
          
          .ProseMirror li {
            margin: 0.25rem 0;
          }
          
          .ProseMirror ul[data-type="taskList"] {
            list-style: none;
            padding-left: 0;
          }
          
          .ProseMirror li[data-type="taskItem"] {
            display: flex;
            align-items: flex-start;
            margin: 0.25rem 0;
          }
          
          .ProseMirror li[data-type="taskItem"] > label {
            margin-right: 0.5rem;
            margin-top: 0.125rem;
            user-select: none;
          }
          
          .ProseMirror li[data-type="taskItem"] > div {
            flex: 1;
          }
          
          .ProseMirror blockquote {
            border-left: 4px solid hsl(var(--border));
            padding-left: 1rem;
            margin: 1rem 0;
            font-style: italic;
            color: hsl(var(--muted-foreground));
          }
          
          .ProseMirror code {
            background-color: hsl(var(--muted));
            padding: 0.125rem 0.25rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
          }
          
          .ProseMirror p {
            margin: 0.5rem 0;
          }
          
          .ProseMirror p:first-child {
            margin-top: 0;
          }
          
          .ProseMirror p:last-child {
            margin-bottom: 0;
          }
          
          .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(data-placeholder);
            float: left;
            color: hsl(var(--muted-foreground));
            pointer-events: none;
            height: 0;
          }
        `
      }} />
      
      <div className={cn("border border-border rounded-lg bg-card overflow-hidden", className)}>
        {/* Toolbar */}
        <div className="border-b border-border bg-muted/30 p-2">
          <div className="flex flex-wrap gap-1 items-center">
            {/* Text Formatting */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBold().run()}
              isActive={editor.isActive('bold')}
              title="Bold"
            >
              <Bold className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleItalic().run()}
              isActive={editor.isActive('italic')}
              title="Italic"
            >
              <Italic className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleStrike().run()}
              isActive={editor.isActive('strike')}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleCode().run()}
              isActive={editor.isActive('code')}
              title="Inline Code"
            >
              <Code className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Headings */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              isActive={editor.isActive('heading', { level: 1 })}
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              isActive={editor.isActive('heading', { level: 2 })}
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              isActive={editor.isActive('heading', { level: 3 })}
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Lists */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              isActive={editor.isActive('bulletList')}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              isActive={editor.isActive('orderedList')}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              isActive={editor.isActive('taskList')}
              title="Task List"
            >
              <CheckSquare className="h-4 w-4" />
            </ToolbarButton>

            <div className="w-px h-6 bg-border mx-1" />

            {/* Other */}
            <ToolbarButton
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              isActive={editor.isActive('blockquote')}
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </ToolbarButton>

            <ToolbarButton
              onClick={addLink}
              isActive={editor.isActive('link')}
              title="Add Link"
            >
              <LinkIcon className="h-4 w-4" />
            </ToolbarButton>
          </div>
        </div>

        {/* Editor */}
        <div className="min-h-[300px] bg-background">
          <EditorContent 
            editor={editor} 
            placeholder={placeholder}
          />
        </div>
      </div>
    </>
  );
}
