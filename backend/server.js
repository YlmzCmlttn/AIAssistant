const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
const connectDB = require('./config/db');
const Chat = require('./models/Chat');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
connectDB();

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Get all chats
app.get('/api/chats', async (req, res) => {
  try {
    const chats = await Chat.find().sort({ createdAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chats' });
  }
});

// Create a new chat
app.post('/api/chats', async (req, res) => {
  try {
    const { title } = req.body;
    const chat = new Chat({ title });
    await chat.save();
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error creating chat' });
  }
});

// Add message to chat
app.post('/api/chat/:chatId/messages', async (req, res) => {
  try {
    const { chatId } = req.params;
    const { role, content } = req.body;
    
    const chat = await Chat.findById(chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    
    chat.messages.push({ role, content });
    await chat.save();
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error adding message' });
  }
});

app.post('/api/chat', async (req, res) => {
  const { question, chatId } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const completion = await openai.createChatCompletion({
      model: "gpt-4o",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: question },
      ],
      stream: true,
    }, { responseType: 'stream' });

    let fullAnswer = '';

    completion.data.on('data', (chunk) => {
      const lines = chunk.toString().split('\n').filter(line => line.trim() !== '');

      for (const line of lines) {
        const message = line.replace(/^data: /, '');
        if (message === '[DONE]') {
          res.write('data: [DONE]\n\n');
          return;
        }

        try {
          const parsed = JSON.parse(message);
          const content = parsed.choices[0].delta.content;
          if (content) {
            fullAnswer += content;
            res.write(`data: ${JSON.stringify({ content })}\n\n`);
          }
        } catch (error) {
          console.error('Error parsing SSE message:', error);
          // Optionally send an error message back to the client
          //res.write(`data: ${JSON.stringify({ error: 'Error parsing message' })}\n\n`);
        }
      }
    });

    completion.data.on('end', async () => {
      if (chatId) {
        try {
          const chat = await Chat.findById(chatId);
          if (chat) {
            chat.messages.push(
              { role: 'user', content: question },
              { role: 'assistant', content: fullAnswer }
            );
            await chat.save();
          }
        } catch (error) {
          console.error('Error saving to database:', error);
        }
      }
      res.end();
    });

    completion.data.on('error', (error) => {
      console.error('Stream error:', error);
      res.write(`data: ${JSON.stringify({ error: 'Stream error occurred' })}\n\n`);
      res.end();
    });

  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error processing your request' });
  }
});

// Get single chat
app.get('/api/chats/:chatId', async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching chat' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
