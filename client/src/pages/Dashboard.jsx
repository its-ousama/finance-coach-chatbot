import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Dashboard() {
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ income: 0, expenses: 0, available: 0 });
  const [showSalaryForm, setShowSalaryForm] = useState(false);
  const [newSalary, setNewSalary] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }
    setUser(JSON.parse(userData));
    fetchTransactions();
  }, [navigate]);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      const trans = response.data;
      setTransactions(trans);
      
      const totalExpenses = trans.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      const totalIncome = trans.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const userData = JSON.parse(localStorage.getItem('user'));
      const salary = userData?.salary || 0;
      
      setStats({
        income: salary + totalIncome,
        expenses: totalExpenses,
        available: salary + totalIncome - totalExpenses
      });
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const updateSalary = async (e) => {
    e.preventDefault();
    try {
      const updatedUser = { ...user, salary: parseFloat(newSalary) };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowSalaryForm(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error updating salary:', error);
    }
  };

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
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <h3 style={{ margin: 0, color: '#1976d2' }}>Monthly Income</h3>
            <button 
              onClick={() => setShowSalaryForm(true)}
              style={{
                padding: '4px 8px',
                background: 'transparent',
                border: '1px solid #1976d2',
                borderRadius: '4px',
                color: '#1976d2',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Edit
            </button>
          </div>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#1976d2' }}>
            €{stats.income}
          </p>
          
          {showSalaryForm && (
            <form onSubmit={updateSalary} style={{ marginTop: '15px', padding: '15px', background: 'white', borderRadius: '4px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: '#333' }}>New Monthly Salary:</label>
              <input
                type="number"
                value={newSalary}
                onChange={(e) => setNewSalary(e.target.value)}
                placeholder={user.salary}
                required
                style={{ padding: '8px', marginRight: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              <button type="submit" style={{ padding: '8px 16px', background: '#1976d2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}>
                Update
              </button>
              <button type="button" onClick={() => setShowSalaryForm(false)} style={{ padding: '8px 16px', background: '#666', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                Cancel
              </button>
            </form>
          )}
        </div>

        <div style={{
          padding: '20px',
          background: '#ffebee',
          borderRadius: '8px',
          border: '1px solid #ef9a9a'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#c62828' }}>Total Expenses</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#c62828' }}>
            €{stats.expenses}
          </p>
          {transactions.length === 0 && <small style={{ color: '#666' }}>No transactions yet</small>}
        </div>

        <div style={{
          padding: '20px',
          background: '#e8f5e9',
          borderRadius: '8px',
          border: '1px solid #a5d6a7'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>Available</h3>
          <p style={{ fontSize: '24px', fontWeight: 'bold', margin: 0, color: '#2e7d32' }}>
            €{stats.available}
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
        <h2 style={{ color: '#333' }}>Quick Actions</h2>
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
        <h3 style={{ margin: '0 0 10px 0', color: '#856404' }}>💡 Budget Tip</h3>
        <p style={{ margin: 0, color: '#856404' }}>
          Start tracking your expenses to see where your money goes. Our AI can help you identify spending patterns and save more!
        </p>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ color: '#333' }}>Recent Transactions</h2>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid #dee2e6'
          }}>
            {transactions.slice(0, 5).map((t) => (
              <div key={t._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid #eee'
              }}>
                <div>
                  <strong style={{ color: '#333' }}>{t.description || t.category}</strong>
                  <br />
                  <small style={{ color: '#666' }}>{new Date(t.date).toLocaleDateString()}</small>
                </div>
                <strong style={{ color: t.type === 'income' ? '#2e7d32' : '#c62828' }}>
                  {t.type === 'income' ? '+' : '-'}€{t.amount}
                </strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;