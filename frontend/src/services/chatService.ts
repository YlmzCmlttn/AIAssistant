import { Chat, Message } from '../types';

const API_URL = 'http://localhost:3000';

export const chatService = {
  async getAllChats(): Promise<Chat[]> {
    const response = await fetch(`${API_URL}/api/chats`);
    return response.json();
  },

  async createChat(title: string): Promise<Chat> {
    const response = await fetch(`${API_URL}/api/chats`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    return response.json();
  },

  async getChat(chatId: string): Promise<Chat> {
    const response = await fetch(`${API_URL}/api/chats/${chatId}`);
    return response.json();
  },

  async sendMessage(question: string, chatId?: string) {
    const response = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, chatId }),
    });
    return response.body?.getReader();
  }
}; 