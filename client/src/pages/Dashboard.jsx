import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #ddd',
        paddingBottom: '10px'
      }}>
        <h1>Finance Coach Dashboard</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span>Welcome, {user.name}!</span>
          <button 
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              background: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        marginBottom: '30px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            padding: '10px 20px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => navigate('/transactions')}
          style={{
            padding: '10px 20px',
            background: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Transactions
        </button>
        <button 
          onClick={() => navigate('/chat')}
          style={{
            padding: '10px 20px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          AI Chat
        </button>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '20px',
        marginBottom: '30px'
      }}>
        <div style={{
          padding: '20px',
          background: '#e3f2fd',
          borderRadius: '8px',
          border: '1px solid #90caf9'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#1976d2' }}>Monthly Income</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            €{user.salary || 0}
          </p>
        </div>

        <div style={{
          padding: '20px',
          background: '#ffebee',
          borderRadius: '8px',
          border: '1px solid #ef9a9a'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#c62828' }}>Total Expenses</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            €0
          </p>
          <small style={{ color: '#666' }}>No transactions yet</small>
        </div>

        <div style={{
          padding: '20px',
          background: '#e8f5e9',
          borderRadius: '8px',
          border: '1px solid #a5d6a7'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Available</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
            €{user.salary || 0}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '20px',
        background: '#f8f9fa',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/transactions')}
            style={{
              padding: '12px 24px',
              background: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Add Transaction
          </button>
          <button 
            onClick={() => navigate('/chat')}
            style={{
              padding: '12px 24px',
              background: '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Chat with AI
          </button>
        </div>
      </div>

      {/* Tips Section */}
      <div style={{
        marginTop: '30px',
        padding: '20px',
        background: '#fff3cd',
        borderRadius: '8px',
        border: '1px solid #ffc107'
      }}>
        <h3 style={{ margin: '0 0 10px 0' }}>💡 Budget Tip</h3>
        <p style={{ margin: 0 }}>
          Start tracking your expenses to see where your money goes. Our AI can help you identify spending patterns and save more!
        </p>
      </div>
    </div>
  );
}

export default Dashboard;