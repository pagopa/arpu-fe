import React from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeSanitize from 'rehype-sanitize';

type MarkdownTextProps = {
  children: string | undefined | null;
};

const allowedTags = {
  tagNames: ['strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'br']
};

export const Markdown = ({ children: markdown }: MarkdownTextProps) => (
  <ReactMarkdown
    data-testid="markdown-content"
    rehypePlugins={[
      [
        rehypeSanitize,
        {
          allowDangerousHtml: false,
          ...allowedTags
        }
      ]
    ]}>
    {markdown ?? ''}
  </ReactMarkdown>
);
