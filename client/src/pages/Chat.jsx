import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m your personal finance coach. I can help you understand your spending, create a budget plan, and give you personalized financial advice. What would you like to know about your finances?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [context, setContext] = useState(null);
  const [showContext, setShowContext] = useState(true);
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
      
      const conversationHistory = messages
        .filter(msg => msg.role !== 'system')
        .slice(-10)
        .map(msg => ({ role: msg.role, content: msg.content }));

      const response = await api.post('/chat/message', { 
        message: userMessage,
        conversationHistory 
      });
      
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: response.data.message 
      }]);
      
      
      if (response.data.context) {
        setContext(response.data.context);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const quickQuestions = [
    "How am I doing this month?",
    "Am I overspending?",
    "Where can I save money?",
    "What's my biggest expense?",
    "Should I cut back on anything?"
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

      {/* Main Content Grid */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: context && showContext ? '2fr 1fr' : '1fr', 
        gap: '20px',
        flex: 1,
        minHeight: 0
      }}>
        {/* Chat Area */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Quick Questions */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ margin: 0, fontWeight: 'bold' }}>💡 Quick questions:</p>
              {/* Show context button when hidden */}
              {context && !showContext && (
                <button
                  onClick={() => setShowContext(true)}
                  style={{
                    padding: '6px 12px',
                    background: '#764ba2',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Show Summary
                </button>
              )}
            </div>
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
              {quickQuestions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => setInput(question)}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    background: '#0e0e0eff',
                    border: '1px solid #7c1481ff',
                    borderRadius: '20px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    color: 'white',
                    opacity: loading ? 0.6 : 1
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
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word'
                  }}
                >
                  {msg.role === 'assistant' && (
                    <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#764ba2' }}>
                      🤖 AI Coach
                    </div>
                  )}
                  <div>{msg.content}</div>
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
                  <div style={{ fontWeight: 'bold', marginBottom: '8px', color: '#764ba2' }}>
                    🤖 AI Coach
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

        {/* Context Panel (shows after first AI response with context) */}
        {context && showContext && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', position: 'relative' }}>
            {/* Close Button */}
            <button
              onClick={() => setShowContext(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '30px',
                height: '30px',
                cursor: 'pointer',
                fontSize: '18px',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
              }}
              title="Hide financial summary"
            >
              x
            </button>
            {/* Quick Stats */}
            <div style={{
              background: 'white',
              borderRadius: '8px',
              border: '2px solid #764ba2',
              padding: '20px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}>
              <h3 style={{ margin: '0 0 15px 0', color: '#764ba2' }}>📊 Your Financial Summary</h3>
              
              <div style={{ marginBottom: '12px' }}>
                <small style={{ color: '#666' }}>Total Income</small>
                <p style={{ margin: '2px 0', fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
                  €{context.totalIncome}
                </p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <small style={{ color: '#666' }}>Total Expenses</small>
                <p style={{ margin: '2px 0', fontSize: '20px', fontWeight: 'bold', color: '#c62828' }}>
                  €{context.totalExpenses}
                </p>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <small style={{ color: '#666' }}>Available</small>
                <p style={{ margin: '2px 0', fontSize: '20px', fontWeight: 'bold', color: '#1976d2' }}>
                  €{context.available}
                </p>
              </div>

              {/* Spending Pace Indicator */}
              {context.spendingPace && (
                <div style={{
                  marginTop: '15px',
                  padding: '12px',
                  background: context.spendingPace.isOverBudget ? '#ffebee' : '#e8f5e9',
                  borderRadius: '8px',
                  border: `2px solid ${context.spendingPace.isOverBudget ? '#ef5350' : '#66bb6a'}`
                }}>
                  <strong style={{
                    display: 'block',
                    marginBottom: '8px',
                    color: context.spendingPace.isOverBudget ? '#c62828' : '#2e7d32',
                    fontSize: '16px'
                  }}>
                    {context.spendingPace.isOverBudget ? '⚠️ Over Pace' : '✅ On Track'}
                  </strong>
                  <small style={{ color: '#666', display: 'block', marginBottom: '4px' }}>
                    Day {context.spendingPace.dayOfMonth} of {context.spendingPace.daysInMonth}
                  </small>
                  <small style={{ color: '#666', display: 'block', marginBottom: '4px' }}>
                    Expected: €{context.spendingPace.shouldHaveSpent}
                  </small>
                  <small style={{ color: '#666', display: 'block', marginBottom: '4px' }}>
                    Actual: €{context.spendingPace.actualSpent}
                  </small>
                  <small style={{ 
                    color: context.spendingPace.isOverBudget ? '#c62828' : '#2e7d32', 
                    display: 'block',
                    fontWeight: 'bold',
                    marginTop: '8px'
                  }}>
                    Daily budget: €{context.spendingPace.dailyBudgetRemaining}/day
                  </small>
                </div>
              )}
            </div>

            {/* Expense Categories */}
            {context.expensesByCategory && Object.keys(context.expensesByCategory).length > 0 && (
              <div style={{
                background: 'white',
                borderRadius: '8px',
                border: '2px solid #764ba2',
                padding: '20px',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#764ba2' }}>💰 Spending by Category</h3>
                {Object.entries(context.expensesByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .map(([category, amount]) => {
                    const percentage = ((amount / context.totalExpenses) * 100).toFixed(0);
                    return (
                      <div key={category} style={{ marginBottom: '15px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <small style={{ 
                            color: '#333', 
                            textTransform: 'capitalize',
                            fontWeight: 'bold'
                          }}>
                            {category}
                          </small>
                          <small style={{ color: '#666' }}>
                            €{amount.toFixed(2)} ({percentage}%)
                          </small>
                        </div>
                        <div style={{
                          width: '100%',
                          height: '8px',
                          background: '#e0e0e0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            width: `${percentage}%`,
                            height: '100%',
                            background: 'linear-gradient(135deg, #764ba2 0%, #667eea 100%)',
                            transition: 'width 0.3s ease'
                          }} />
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;