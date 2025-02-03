const express = require('express');
const cors = require('cors');
const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

app.post('/api/chat', async (req, res) => {
  console.log('/api/chat');
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4o", // Use the correct model
      messages: [
        { role: "system", content: "You are a helpful assistant." }, // Correct role
        { role: "user", content: question }, // Use user input dynamically
      ],
    });

    console.log(completion.data.choices[0].message.content); // Corrected logging
    res.json({ answer: completion.data.choices[0].message.content }); // Send response
  } catch (error) {
    console.error('Error calling OpenAI API:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error processing your request' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend server listening on port ${PORT}`);
});
