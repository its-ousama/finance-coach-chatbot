import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your personal finance coach. Ask me anything about budgeting, saving money, or managing your expenses!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await api.post('/chat/message', { message: userMessage });
      setMessages(prev => [...prev, { role: 'assistant', content: response.data.message }]);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "How can I save more money?",
    "Analyze my spending",
    "Give me budgeting tips",
    "How much should I save monthly?"
  ];

  return (
    <div style={{ padding: '20px', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            padding: '8px 16px', 
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #0d0d0dff 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div style={{ 
        background: 'linear-gradient(135deg, #0d0d0dff 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        color: 'white'
      }}>
        <h1 style={{ margin: 0 }}>AI Finance Coach</h1>
        <p style={{ margin: '5px 0 0 0' }}>Get personalized financial advice based on your spending</p>
      </div>

      {/* Quick Questions */}
      <div style={{ marginBottom: '20px' }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Quick questions:</p>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {quickQuestions.map((question, idx) => (
            <button
              key={idx}
              onClick={() => setInput(question)}
              style={{
                padding: '8px 16px',
                background: '#0e0e0eff',
                border: '1px solid #7c1481ff',
                borderRadius: '20px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        background: 'linear-gradient(135deg, #0d0d0dff 30%, #764ba2 70%)',
        padding: '20px',
        borderRadius: '8px',
        marginBottom: '20px',
        border: '1px solid #7c1481ff'
      }}>
        {messages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              display: 'flex',
              justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '15px'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '12px',
                background: msg.role === 'user' ? '#200240ff' : 'white',
                color: msg.role === 'user' ? 'white' : 'black',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            >
              {msg.role === 'assistant' && (
                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#23182bff' }}>
                  AI Coach
                </div>
              )}
              <div style={{ whiteSpace: 'pre-wrap' }}>{msg.content}</div>
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '15px' }}>
            <div style={{
              padding: '12px 16px',
              borderRadius: '12px',
              background: 'white',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#667eea' }}>
                AI Coach
              </div>
              Thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} style={{ display: 'flex', gap: '10px' }}>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything about your finances..."
          disabled={loading}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #dee2e6',
            borderRadius: '24px',
            fontSize: '16px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px',
            background: loading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default Chat;