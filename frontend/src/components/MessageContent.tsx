import { CodeBlock } from '../types';
import { parseMessage } from '../utils/messageParser';

export function MessageContent({ content }: { content: string }) {
  const parts = parseMessage(content);

  return (
    <div className="whitespace-pre-wrap">
      {parts.map((part, index) => {
        switch (part.type) {
          case 'code':
            const codeBlock = part.content as CodeBlock;
            return (
              <div 
                key={index}
                className="my-4 rounded-lg overflow-hidden bg-gray-800"
              >
                <div className="px-4 py-2 bg-gray-700 text-gray-200 text-sm font-mono">
                  {codeBlock.language}
                </div>
                <pre className="p-4 overflow-x-auto">
                  <code className="text-gray-200 font-mono text-sm">
                    {codeBlock.code}
                  </code>
                </pre>
              </div>
            );
          case 'bold':
            return (
              <strong key={index} className="text-blue-600 font-semibold">
                {part.content as string}
              </strong>
            );
          default:
            return <span key={index}>{part.content as string}</span>;
        }
      })}
    </div>
  );
} 