import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    category: 'groceries',
    description: '',
    type: 'expense'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const response = await api.get('/transactions');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', formData);
      setFormData({ amount: '', category: 'groceries', description: '', type: 'expense' });
      setShowForm(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this transaction?')) {
      try {
        await api.delete(`/transactions/${id}`);
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction:', error);
      }
    }
  };

  return (
    <div style={{ 
      padding: '20px 10%', 
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      background: 'linear-gradient(135deg, #0d0d0dff 30%, #764ba2 70%)'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid rgba(255, 255, 255, 0.2)',
        paddingBottom: '10px'
      }}>
        <h1 style={{ color: 'white', margin: 0 }}>Transactions</h1>
        <button 
          onClick={() => navigate('/dashboard')} 
          style={{ 
            padding: '8px 16px', 
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          ← Back to Dashboard
        </button>
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
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
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
            background: '#764ba2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Transactions
        </button>
        <button 
          onClick={() => navigate('/chat')}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          AI Chat
        </button>
      </div>

      {/* Add Transaction Button */}
      <button 
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '12px 24px',
          background: showForm ? '#dc3545' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px',
          fontWeight: 'bold'
        }}
      >
        {showForm ? 'Cancel' : '+ Add Transaction'}
      </button>

      {/* Transaction Form */}
      {showForm && (
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '30px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <h3 style={{ color: 'white', marginTop: 0 }}>New Transaction</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'white' }}>Type:</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid rgba(255, 255, 255, 0.3)', 
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              >
                <option value="expense" style={{ background: '#1a1a1a' }}>Expense</option>
                <option value="income" style={{ background: '#1a1a1a' }}>Income</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'white' }}>Amount (€):</label>
              <input
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid rgba(255, 255, 255, 0.3)', 
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'white' }}>Category:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid rgba(255, 255, 255, 0.3)', 
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white'
                }}
              >
                <option value="groceries" style={{ background: '#1a1a1a' }}>Groceries</option>
                <option value="transport" style={{ background: '#1a1a1a' }}>Transport</option>
                <option value="entertainment" style={{ background: '#1a1a1a' }}>Entertainment</option>
                <option value="bills" style={{ background: '#1a1a1a' }}>Bills</option>
                <option value="shopping" style={{ background: '#1a1a1a' }}>Shopping</option>
                <option value="healthcare" style={{ background: '#1a1a1a' }}>Healthcare</option>
                <option value="dining" style={{ background: '#1a1a1a' }}>Dining</option>
                <option value="other" style={{ background: '#1a1a1a' }}>Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', color: 'white' }}>Description:</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Optional"
                style={{ 
                  width: '100%', 
                  padding: '10px', 
                  border: '1px solid rgba(255, 255, 255, 0.3)', 
                  borderRadius: '4px',
                  background: 'rgba(255, 255, 255, 0.1)',
                  color: 'white',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#764ba2',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Add Transaction
            </button>
          </form>
        </div>
      )}

      {/* Transactions Table */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '20px',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ color: 'white', marginTop: 0 }}>All Transactions</h3>
        {transactions.length === 0 ? (
          <p style={{ color: 'rgba(255, 255, 255, 0.7)' }}>No transactions yet. Add your first transaction above!</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid rgba(255, 255, 255, 0.3)' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'white' }}>Date</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'white' }}>Description</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'white' }}>Category</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: 'white' }}>Type</th>
                  <th style={{ padding: '12px', textAlign: 'right', color: 'white' }}>Amount</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: 'white' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction._id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.1)' }}>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', color: 'rgba(255, 255, 255, 0.9)' }}>
                      {transaction.description || '-'}
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: 'rgba(118, 75, 162, 0.3)',
                        border: '1px solid rgba(118, 75, 162, 0.6)',
                        borderRadius: '12px',
                        fontSize: '12px',
                        color: 'white',
                        textTransform: 'capitalize'
                      }}>
                        {transaction.category}
                      </span>
                    </td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 12px',
                        background: transaction.type === 'income' ? 'rgba(76, 175, 80, 0.2)' : 'rgba(239, 83, 80, 0.2)',
                        border: `1px solid ${transaction.type === 'income' ? '#4caf50' : '#ef5350'}`,
                        color: transaction.type === 'income' ? '#4caf50' : '#ef5350',
                        borderRadius: '12px',
                        fontSize: '12px',
                        textTransform: 'capitalize'
                      }}>
                        {transaction.type}
                      </span>
                    </td>
                    <td style={{ 
                      padding: '12px', 
                      textAlign: 'right',
                      color: transaction.type === 'income' ? '#4caf50' : '#ef5350',
                      fontWeight: 'bold',
                      fontSize: '16px'
                    }}>
                      {transaction.type === 'income' ? '+' : '-'}€{transaction.amount}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(transaction._id)}
                        style={{
                          padding: '6px 12px',
                          background: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontSize: '12px'
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default Transactions;