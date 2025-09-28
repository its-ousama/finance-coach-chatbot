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
    <div style={{ padding: '20px' }}>
      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', marginRight: '10px', cursor: 'pointer' }}>
          ← Back to Dashboard
        </button>
      </div>

      <h1>Transactions</h1>

      <button 
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: '10px 20px',
          background: '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        {showForm ? 'Cancel' : '+ Add Transaction'}
      </button>

      {showForm && (
        <div style={{
          background: '#0c0c0cff',
          padding: '20px',
          borderRadius: '8px',
          marginBottom: '20px',
          border: '1px solid #dee2e6'
        }}>
          <h3>New Transaction</h3>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Type:</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Amount (€):</label>
              <input
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Category:</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              >
                <option value="groceries">Groceries</option>
                <option value="transport">Transport</option>
                <option value="entertainment">Entertainment</option>
                <option value="bills">Bills</option>
                <option value="shopping">Shopping</option>
                <option value="healthcare">Healthcare</option>
                <option value="dining">Dining</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px' }}>Description:</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                style={{ width: '100%', padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
            </div>

            <button
              type="submit"
              style={{
                padding: '10px 20px',
                background: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Add Transaction
            </button>
          </form>
        </div>
      )}

      <div>
        <h3>Recent Transactions</h3>
        {transactions.length === 0 ? (
          <p style={{ color: '#666' }}>No transactions yet. Add your first transaction above!</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#0b0b0bff', borderBottom: '2px solid #dee2e6' }}>
                <th style={{ padding: '10px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Description</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Category</th>
                <th style={{ padding: '10px', textAlign: 'left' }}>Type</th>
                <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '10px', textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction._id} style={{ borderBottom: '1px solid #dee2e6' }}>
                  <td style={{ padding: '10px' }}>
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '10px' }}>{transaction.description || '-'}</td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: '#45494bff',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {transaction.category}
                    </span>
                  </td>
                  <td style={{ padding: '10px' }}>
                    <span style={{
                      padding: '4px 8px',
                      background: transaction.type === 'income' ? '#e8f5e9' : '#ffebee',
                      color: transaction.type === 'income' ? '#2e7d32' : '#c62828',
                      borderRadius: '4px',
                      fontSize: '12px'
                    }}>
                      {transaction.type}
                    </span>
                  </td>
                  <td style={{ 
                    padding: '10px', 
                    textAlign: 'right',
                    color: transaction.type === 'income' ? '#2e7d32' : '#c62828',
                    fontWeight: 'bold'
                  }}>
                    {transaction.type === 'income' ? '+' : '-'}€{transaction.amount}
                  </td>
                  <td style={{ padding: '10px', textAlign: 'center' }}>
                    <button
                      onClick={() => handleDelete(transaction._id)}
                      style={{
                        padding: '4px 12px',
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
        )}
      </div>
    </div>
  );
}

export default Transactions;