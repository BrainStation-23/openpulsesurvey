
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Bold, Italic, List, ListOrdered, 
  Quote, Undo, Redo, Send 
} from "lucide-react";
import type { EmailResponse } from "../../types";

interface EmailEditorProps {
  onSubmit: (response: EmailResponse) => Promise<void>;
}

export function EmailEditor({ onSubmit }: EmailEditorProps) {
  const editor = useEditor({
    extensions: [StarterKit],
    content: "",
    editorProps: {
      attributes: {
        class: "prose dark:prose-invert max-w-none focus:outline-none min-h-[200px]",
      },
    },
  });

  const handleSubmit = async () => {
    if (!editor) return;
    
    const response: EmailResponse = {
      subject: document.querySelector<HTMLInputElement>('input[name="subject"]')?.value || "",
      content: editor.getHTML(),
    };

    await onSubmit(response);
  };

  if (!editor) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 border-b pb-4">
        <Input 
          name="subject"
          placeholder="Subject"
          className="flex-1"
        />
      </div>
      
      <div className="flex items-center gap-2 border-b pb-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBold().run()}
          data-active={editor.isActive('bold')}
          className="data-[active=true]:bg-accent"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          data-active={editor.isActive('italic')}
          className="data-[active=true]:bg-accent"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          data-active={editor.isActive('bulletList')}
          className="data-[active=true]:bg-accent"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          data-active={editor.isActive('orderedList')}
          className="data-[active=true]:bg-accent"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          data-active={editor.isActive('blockquote')}
          className="data-[active=true]:bg-accent"
        >
          <Quote className="h-4 w-4" />
        </Button>
        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <EditorContent editor={editor} />
      
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSubmit} className="gap-2">
          <Send className="h-4 w-4" />
          Send Response
        </Button>
      </div>
    </div>
  );
}
