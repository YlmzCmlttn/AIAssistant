import { Message } from '../types';
import { MessageContent } from './MessageContent';

interface ChatMessageProps {
  message: Message;
}

export function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === 'assistant';
  
  return (
    <div className={`mb-6 rounded-lg ${isAssistant ? 'bg-gray-50' : 'bg-white'}`}>
      <div className="border-b border-gray-200 px-6 py-3">
        <span className={`font-medium ${isAssistant ? 'text-blue-600' : 'text-gray-700'}`}>
          {isAssistant ? 'Assistant' : 'You'}
        </span>
      </div>
      <div className="px-6 py-4">
        <MessageContent content={message.content} />
      </div>
    </div>
  );
} 