import { MessageContent, CodeBlock } from '../types';

export function parseMessage(content: string): MessageContent[] {
  const parts: MessageContent[] = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const boldRegex = /\*\*(.*?)\*\*/g;
  
  let lastIndex = 0;
  let match;

  // Find code blocks
  while ((match = codeBlockRegex.exec(content)) !== null) {
    if (match.index > lastIndex) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex, match.index)
      });
    }

    parts.push({
      type: 'code',
      content: {
        language: match[1] || 'plaintext',
        code: match[2].trim()
      }
    });

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < content.length) {
    const remainingText = content.slice(lastIndex);
    let boldLastIndex = 0;
    let boldMatch;
    const boldParts: MessageContent[] = [];

    while ((boldMatch = boldRegex.exec(remainingText)) !== null) {
      if (boldMatch.index > boldLastIndex) {
        boldParts.push({
          type: 'text',
          content: remainingText.slice(boldLastIndex, boldMatch.index)
        });
      }

      boldParts.push({
        type: 'bold',
        content: boldMatch[1]
      });

      boldLastIndex = boldMatch.index + boldMatch[0].length;
    }

    if (boldLastIndex < remainingText.length) {
      boldParts.push({
        type: 'text',
        content: remainingText.slice(boldLastIndex)
      });
    }

    parts.push(...boldParts);
  }

  return parts;
} 