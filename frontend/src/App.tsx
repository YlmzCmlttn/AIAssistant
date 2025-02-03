import { useState, useEffect } from 'react';
import { Chat, Message } from './types';
import { chatService } from './services/chatService';
import { ChatList } from './components/ChatList';
import { ChatMessage } from './components/ChatMessage';
import { MessageContent } from './components/MessageContent';

function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLoadingChats, setIsLoadingChats] = useState(true);

  useEffect(() => {
    loadChats();
  }, []);

  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      const data = await chatService.getAllChats();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setIsLoadingChats(false);
    }
  };

  const createNewChat = async () => {
    try {
      const newChat = await chatService.createChat('New Chat');
      setChats(prevChats => [newChat, ...prevChats]);
      setCurrentChat(newChat);
      setQuestion('');
      setAnswer('');
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    if (!currentChat) {
      await createNewChat();
    }

    setLoading(true);
    const currentQuestion = question;
    setQuestion('');

    // Immediately add user message to UI
    if (currentChat) {
      const updatedChat = {
        ...currentChat,
        messages: [...currentChat.messages, { role: 'user', content: currentQuestion }]
      };
      setCurrentChat(updatedChat);
      setChats(prevChats => 
        prevChats.map(chat => 
          chat._id === currentChat._id ? updatedChat : chat
        )
      );
    }

    try {
      const reader = await chatService.sendMessage(currentQuestion, currentChat?._id);
      let fullAnswer = '';

      while (reader) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;
            
            try {
              const parsed = JSON.parse(data);
              if (parsed.content) {
                fullAnswer += parsed.content;
                setAnswer(fullAnswer);
              }
            } catch (error) {
              console.error('Error parsing chunk:', error);
            }
          }
        }
      }

      // Fetch updated chat after completion
      if (currentChat?._id) {
        const updatedChat = await chatService.getChat(currentChat._id);
        setCurrentChat(updatedChat);
        setChats(prevChats => 
          prevChats.map(chat => 
            chat._id === updatedChat._id ? updatedChat : chat
          )
        );
        setAnswer('');
      }
    } catch (error) {
      console.error('Error:', error);
      setAnswer('Error: Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      <ChatList
        chats={chats}
        currentChat={currentChat}
        onSelectChat={setCurrentChat}
        onNewChat={createNewChat}
        isLoading={isLoadingChats}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <header className="px-8 py-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-gray-800">
            {currentChat?.title || 'ChatGPT Code Assistant'}
          </h1>
        </header>

        <div className="flex-1 overflow-y-auto px-8 py-6">
          <div className="max-w-3xl mx-auto">
            {currentChat?.messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))}
            {answer && (
              <div className="mb-6 rounded-lg bg-gray-50">
                <div className="border-b border-gray-200 px-6 py-3">
                  <span className="font-medium text-blue-600">Assistant</span>
                </div>
                <div className="px-6 py-4">
                  <MessageContent content={answer} />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-gray-200 px-8 py-6">
          <div className="max-w-3xl mx-auto">
            <form onSubmit={handleSubmit}>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask your coding question here... (Press Enter to submit, Shift+Enter for new line)"
                rows={4}
                className="w-full p-4 text-base border border-gray-300 rounded-lg resize-none 
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              
              <div className="mt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className={`px-6 py-3 rounded-lg font-medium text-white
                    transition-colors duration-200
                    ${loading 
                      ? 'bg-gray-400 cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                >
                  {loading ? 'Processing...' : 'Send'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
