import { render, screen } from '__tests__/renderers';
import { describe, expect, it } from 'vitest';
import { Markdown } from './Markdown';
import React from 'react';

describe('MarkdownText Component', () => {
  it('renders allowed tags in the markdown', () => {
    const markdown = `# Heading 
 &nsbp;
			**Bold Text** _Italic Text_`;
    render(<Markdown>{markdown}</Markdown>);

    expect(screen.getByText('Heading').tagName).toBe('H1');
    expect(screen.getByText('Bold Text').tagName).toBe('STRONG');
    expect(screen.getByText('Italic Text').tagName).toBe('EM');
  });

  it('does not render non-whitelisted tags', () => {
    const markdown = '[link](phishing)';
    render(<Markdown>{markdown}</Markdown>);

    expect(screen.getByText('link').tagName).toBe('DIV');
    expect(screen.queryByText('A')).not.toBeInTheDocument();
  });

  it('sanitizes dangerous HTML content', () => {
    const markdown = "**Safe**<script>alert('Hacked!')";
    render(<Markdown>{markdown}</Markdown>);

    expect(screen.getByText("alert('Hacked!')").tagName).not.toBe('SCRIPT');
    expect(screen.getByText('Safe')).toBeInTheDocument();
    expect(screen.getByText('Safe').tagName).toBe('STRONG');
  });
});
