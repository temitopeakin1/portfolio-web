export interface SlashCommand {
  id: string;
  label: string;
  description: string;
  icon: string;
  /** Markdown inserted at the slash trigger position */
  insert: string;
}

export const BLOG_SLASH_COMMANDS: SlashCommand[] = [
  { id: 'h1', label: 'Heading 1', description: 'Large section heading', icon: 'H1', insert: '# ' },
  { id: 'h2', label: 'Heading 2', description: 'Medium section heading', icon: 'H2', insert: '## ' },
  { id: 'h3', label: 'Heading 3', description: 'Small section heading', icon: 'H3', insert: '### ' },
  { id: 'text', label: 'Text', description: 'Plain paragraph', icon: '¶', insert: '' },
  { id: 'bullet', label: 'Bulleted list', description: 'Unordered list', icon: '•', insert: '- ' },
  { id: 'number', label: 'Numbered list', description: 'Ordered list', icon: '1.', insert: '1. ' },
  { id: 'quote', label: 'Quote', description: 'Blockquote', icon: '❝', insert: '> ' },
  { id: 'code', label: 'Code block', description: 'Fenced code', icon: '</>', insert: '```\n\n```' },
  { id: 'image', label: 'Image', description: 'Embed an image', icon: '🖼', insert: '![alt text](https://)' },
  { id: 'divider', label: 'Divider', description: 'Horizontal rule', icon: '—', insert: '\n---\n' },
  { id: 'link', label: 'Link', description: 'Hyperlink', icon: '🔗', insert: '[link text](https://)' },
  { id: 'bold', label: 'Bold', description: 'Strong emphasis', icon: 'B', insert: '**bold text**' },
  { id: 'italic', label: 'Italic', description: 'Emphasis', icon: 'I', insert: '*italic text*' },
];
