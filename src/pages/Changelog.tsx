
import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const Changelog = () => {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch('/CHANGELOG.md')
      .then((response) => response.text())
      .then((text) => setContent(text))
      .catch((error) => console.error('Error loading changelog:', error));
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <article className="prose prose-slate max-w-none">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
    </div>
  );
};

export default Changelog;
