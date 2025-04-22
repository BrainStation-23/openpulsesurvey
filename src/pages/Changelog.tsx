
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Loader2, GitCommit } from 'lucide-react';

const Changelog = () => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/CHANGELOG.md')
      .then((response) => response.text())
      .then((text) => {
        setContent(text);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('Error loading changelog:', error);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20">
      <div className="container mx-auto px-4 py-12">
        <div className="flex items-center gap-3 mb-8">
          <GitCommit className="h-8 w-8 text-primary" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Changelog
          </h1>
        </div>
        
        <div className="relative">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-primary/5 to-transparent rounded-lg -z-10" />
          <div className="absolute top-0 left-0 w-full h-full bg-white/50 dark:bg-black/10 backdrop-blur-3xl rounded-lg -z-20" />
          
          {/* Content */}
          <article className="prose prose-slate dark:prose-invert max-w-none p-8 rounded-lg shadow-lg">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="flex items-center gap-2 text-2xl font-bold text-primary mb-4 pb-2 border-b">
                    <span className="text-sm bg-primary/10 rounded-full p-1">
                      <GitCommit className="h-4 w-4" />
                    </span>
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="text-xl font-semibold text-primary/80 mt-6 mb-3">
                    {children}
                  </h3>
                ),
                ul: ({ children }) => (
                  <ul className="space-y-2 my-4">
                    {children}
                  </ul>
                ),
                li: ({ children }) => (
                  <li className="flex items-start gap-2">
                    <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/60 flex-shrink-0" />
                    <span>{children}</span>
                  </li>
                ),
                a: ({ href, children }) => (
                  <a
                    href={href}
                    className="text-primary hover:text-primary/80 underline decoration-primary/30 underline-offset-4 transition-colors"
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {content}
            </ReactMarkdown>
          </article>
        </div>
      </div>
    </div>
  );
};

export default Changelog;
