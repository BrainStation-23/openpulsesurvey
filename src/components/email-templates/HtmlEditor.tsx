
import React, { useEffect, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";

interface HtmlEditorProps {
  id?: string;
  initialValue?: string;
  onChange: (content: string) => void;
}

export function HtmlEditor({ id = "html-editor", initialValue = "", onChange }: HtmlEditorProps) {
  const editorRef = useRef<any>(null);

  // Initialize TinyMCE from CDN
  useEffect(() => {
    const loadScript = () => {
      if (window.tinymce) return;
      
      const script = document.createElement("script");
      script.src = "https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js";
      script.referrerPolicy = "origin";
      document.head.appendChild(script);
    };
    
    loadScript();
  }, []);

  return (
    <Editor
      id={id}
      apiKey={null} // Using the no-api-key version from CDN
      onInit={(evt, editor) => (editorRef.current = editor)}
      initialValue={initialValue}
      onEditorChange={onChange}
      init={{
        height: 400,
        menubar: false,
        plugins: [
          "advlist", "autolink", "lists", "link", "image", "charmap", "preview", 
          "searchreplace", "visualblocks", "code", "fullscreen",
          "insertdatetime", "media", "table", "help", "wordcount"
        ],
        toolbar: 
          "undo redo | styles | bold italic forecolor | " +
          "alignleft aligncenter alignright alignjustify | " +
          "bullist numlist outdent indent | link image | " +
          "removeformat | code | help",
        content_style: `
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif; 
            font-size: 16px; 
            line-height: 1.5;
            padding: 0.5rem;
          }
          .mce-content-body [data-mce-selected="inline-boundary"] {
            background-color: #e9f5ff;
          }
        `,
        branding: false,
        promotion: false,
        setup: (editor) => {
          // Add placeholder text if the editor is empty
          editor.on('init', () => {
            if (editor.getContent() === '') {
              editor.setContent('<p>Enter your email content here...</p>');
            }
          });
        }
      }}
    />
  );
}
