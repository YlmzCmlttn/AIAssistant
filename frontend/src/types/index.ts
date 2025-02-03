export interface Chat {
  _id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface CodeBlock {
  language: string;
  code: string;
}

export interface MessageContent {
  type: 'text' | 'code' | 'bold';
  content: string | CodeBlock;
} 