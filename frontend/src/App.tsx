import React, { useState } from 'react';

function App() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);

  // VITE_API_URL should be defined in your environment variables.
  // For local development, you can create a `.env` file in the frontend folder with:
  // VITE_API_URL=http://localhost:3000
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5173';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAnswer('');

    try {
      console.log(`${apiUrl}/api/chat`);
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ question })
      });
      const data = await response.json();
      if (response.ok) {
        setAnswer(data.answer);
      } else {
        setAnswer(data.error || 'An error occurred');
      }
    } catch (error: any) {
      setAnswer('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>ChatGPT Code Assistant</h1>
      <form onSubmit={handleSubmit}>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask your coding question here..."
          rows={5}
          style={{ width: '100%', fontSize: '1rem' }}
          required
        ></textarea>
        <br />
        <button type="submit" disabled={loading} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>
          {loading ? 'Loading...' : 'Submit'}
        </button>
      </form>
      {answer && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Answer:</h2>
          <pre style={{ background: '#f4f4f4', padding: '1rem' }}>{answer}</pre>
        </div>
      )}
    </div>
  );
}

export default App;
