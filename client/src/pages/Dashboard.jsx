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
      const response = await api.put('/auth/salary', { salary: parseFloat(newSalary) });
      
      const updatedUser = { ...user, salary: parseFloat(newSalary) };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      setShowSalaryForm(false);
      setNewSalary('');
      
      fetchTransactions();
    } catch (error) {
      console.error('Error updating salary:', error);
      alert('Failed to update salary. Please try again.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  // Calculate spending pace based on date
  const getSpendingPace = () => {
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayOfMonth = today.getDate();
    const daysRemaining = daysInMonth - dayOfMonth;
    
    const monthlyBudget = stats.income;
    const dailyBudget = monthlyBudget / daysInMonth;
    const shouldHaveSpent = dailyBudget * dayOfMonth;
    const spentSoFar = stats.expenses;
    const difference = spentSoFar - shouldHaveSpent;
    
    const remainingBudget = stats.income - spentSoFar;
    const dailyBudgetRemaining = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;
    
    const burnRate = dayOfMonth > 0 ? (spentSoFar / dayOfMonth) * daysInMonth : 0;
    
    let status = 'good';
    let statusText = 'On Track';
    let statusColor = '#2e7d32';
    let bgColor = '#e8f5e9';
    
    if (difference > monthlyBudget * 0.2) {
      status = 'danger';
      statusText = 'Overspending';
      statusColor = '#c62828';
      bgColor = '#ffebee';
    } else if (difference > 0) {
      status = 'warning';
      statusText = 'Caution';
      statusColor = '#f57c00';
      bgColor = '#fff3e0';
    }
    
    return {
      dayOfMonth,
      daysInMonth,
      daysRemaining,
      shouldHaveSpent: shouldHaveSpent.toFixed(2),
      spentSoFar: spentSoFar.toFixed(2),
      difference: Math.abs(difference).toFixed(2),
      isOver: difference > 0,
      dailyBudgetRemaining: dailyBudgetRemaining.toFixed(2),
      projectedSpending: burnRate.toFixed(2),
      status,
      statusText,
      statusColor,
      bgColor,
      monthName: today.toLocaleDateString('en-US', { month: 'long' })
    };
  };

  
  const getBudgetTip = () => {
    if (transactions.length === 0) {
      return "Start tracking your expenses to see where your money goes. Add your first transaction to get personalized insights!";
    }
    
    if (stats.available < 0) {
      return "⚠️ You're spending more than you earn! Consider reducing expenses in your biggest controllable spending categories.";
    }
    
    if (stats.expenses === 0) {
      return "Great! You haven't recorded any expenses yet. Start tracking to get personalized budget advice.";
    }
    
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});
    
    const sortedCategories = Object.entries(expensesByCategory)
      .sort(([,a], [,b]) => b - a);
    
    if (sortedCategories.length >= 2) {
      let targetCategory = sortedCategories[0];
      if (targetCategory[0] === 'bills' && sortedCategories.length > 1) {
        targetCategory = sortedCategories[1];
      }
      
      const [category, amount] = targetCategory;
      const percentage = ((amount / stats.expenses) * 100).toFixed(0);
      
      let advice = "";
      switch(category) {
        case 'dining':
          advice = "Try meal prepping or cooking at home more often to save 20-30%.";
          break;
        case 'entertainment':
          advice = "Look for free activities or group discounts to reduce this by 15-25%.";
          break;
        case 'transport':
          advice = "Consider walking, biking, or carpooling to cut this expense.";
          break;
        case 'shopping':
          advice = "Try the 24-hour rule before purchases and make shopping lists.";
          break;
        case 'groceries':
          advice = "Plan meals, buy in bulk, and use store brands to save 10-20%.";
          break;
        default:
          advice = "Consider ways to reduce this category by 10-20% to increase savings.";
      }
      
      return `Your biggest controllable expense is ${category} (€${amount}, ${percentage}% of spending). ${advice}`;
    }
    
    if (stats.income > 0) {
      const savingsRate = ((stats.available / stats.income) * 100).toFixed(0);
      if (savingsRate < 10) {
        return "You're saving less than 10% of your income. Try to increase savings by reducing discretionary spending.";
      } else if (savingsRate < 20) {
        return `You're saving ${savingsRate}% of your income. Great start! Aim for 20% to build a strong financial foundation.`;
      } else {
        return `Excellent! You're saving ${savingsRate}% of your income. Consider investing some of these savings for long-term growth.`;
      }
    }
    
    return "Track more expenses to get personalized budget advice based on your spending patterns.";
  };

  if (!user) return <div>Loading...</div>;

  const spendingPace = getSpendingPace();

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
        <h1 style={{ color: 'white', margin: 0 }}>Finance Coach Dashboard</h1>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <span style={{ color: 'white' }}>Welcome, {user.name}!</span>
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
            background: '#764ba2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Dashboard
        </button>
        <button 
          onClick={() => navigate('/transactions')}
          style={{
            padding: '10px 20px',
            background: 'rgba(255, 255, 255, 0.1)',
            color: 'white',
            border: '1px solid rgba(255, 255, 255, 0.3)',
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

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(3, 1fr)',
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

      {/* Spending Pace Tracker */}
      <div style={{
        padding: '20px',
        background: spendingPace.bgColor,
        borderRadius: '8px',
        border: `2px solid ${spendingPace.statusColor}`,
        marginBottom: '30px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h2 style={{ margin: 0, color: '#333' }}>📊 Spending Pace</h2>
          <span style={{ 
            padding: '6px 12px', 
            background: spendingPace.statusColor, 
            color: 'white', 
            borderRadius: '20px',
            fontSize: '14px',
            fontWeight: 'bold'
          }}>
            {spendingPace.statusText}
          </span>
        </div>
        
        <div style={{ marginBottom: '15px' }}>
          <p style={{ margin: '5px 0', color: '#666' }}>
            {spendingPace.monthName} Day {spendingPace.dayOfMonth} of {spendingPace.daysInMonth} 
            <strong style={{ color: '#333' }}> ({spendingPace.daysRemaining} days remaining)</strong>
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px',
          marginBottom: '15px'
        }}>
          <div>
            <small style={{ color: '#666' }}>You've spent:</small>
            <p style={{ margin: '5px 0', fontSize: '20px', fontWeight: 'bold', color: spendingPace.statusColor }}>
              €{spendingPace.spentSoFar}
            </p>
            <small style={{ color: '#666' }}>Expected: €{spendingPace.shouldHaveSpent}</small>
          </div>

          <div>
            <small style={{ color: '#666' }}>Daily budget remaining:</small>
            <p style={{ margin: '5px 0', fontSize: '20px', fontWeight: 'bold', color: '#2e7d32' }}>
              €{spendingPace.dailyBudgetRemaining}/day
            </p>
            <small style={{ color: '#666' }}>For next {spendingPace.daysRemaining} days</small>
          </div>

          <div>
            <small style={{ color: '#666' }}>Projected month-end:</small>
            <p style={{ margin: '5px 0', fontSize: '20px', fontWeight: 'bold', color: spendingPace.statusColor }}>
              €{spendingPace.projectedSpending}
            </p>
            <small style={{ color: '#666' }}>
              {parseFloat(spendingPace.projectedSpending) > stats.income ? '⚠️ Over budget' : '✅ Within budget'}
            </small>
          </div>
        </div>

        {spendingPace.isOver ? (
          <div style={{ 
            padding: '12px', 
            background: 'rgba(211, 47, 47, 0.1)', 
            borderRadius: '6px',
            borderLeft: '4px solid #d32f2f'
          }}>
            <strong style={{ color: '#c62828' }}>💡 Action needed: </strong>
            <span style={{ color: '#666' }}>
              You're €{spendingPace.difference} over pace. 
              {parseFloat(spendingPace.dailyBudgetRemaining) > 0 
                ? ` Stick to €${spendingPace.dailyBudgetRemaining}/day to stay on track.`
                : ' Consider reducing spending immediately to avoid overspending.'}
            </span>
          </div>
        ) : (
          <div style={{ 
            padding: '12px', 
            background: 'rgba(46, 125, 50, 0.1)', 
            borderRadius: '6px',
            borderLeft: '4px solid #2e7d32'
          }}>
            <strong style={{ color: '#2e7d32' }}>✅ Great job! </strong>
            <span style={{ color: '#666' }}>
              You're €{spendingPace.difference} under pace. 
              Keep up the good work and consider saving the extra money!
            </span>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div style={{
        padding: '20px',
        background: 'linear-gradient(135deg, #0d0d0dff 30%, #764ba2 70%',
        borderRadius: '8px',
        border: '1px solid #dee2e6'
      }}>
        <h2 style={{ color: '#ddb5f2ff' }}>Quick Actions</h2>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button 
            onClick={() => navigate('/transactions')}
            style={{
              padding: '12px 24px',
              background: '#171617ff',
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
              background: '#764ba2',
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
        background: 'rgba(255, 243, 205, 0.15)',
        borderRadius: '8px',
        border: '1px solid rgba(255, 193, 7, 0.3)',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', color: '#ffd54f' }}>💡 Budget Tip</h3>
        <p style={{ margin: 0, color: 'white' }}>
          {getBudgetTip()}
        </p>
      </div>

      {/* Recent Transactions */}
      {transactions.length > 0 && (
        <div style={{ marginTop: '30px' }}>
          <h2 style={{ color: 'white' }}>Recent Transactions</h2>
          <div style={{
            background: 'rgba(255, 255, 255, 0.1)',
            padding: '20px',
            borderRadius: '8px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            {transactions.slice(0, 5).map((t) => (
              <div key={t._id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '10px 0',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
              }}>
                <div>
                  <strong style={{ color: 'white' }}>{t.description || t.category}</strong>
                  <br />
                  <small style={{ color: 'rgba(255, 255, 255, 0.7)' }}>{new Date(t.date).toLocaleDateString()}</small>
                </div>
                <strong style={{ color: t.type === 'income' ? '#4caf50' : '#ef5350' }}>
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