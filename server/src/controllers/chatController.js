const OpenAI = require('openai');
const Transaction = require('../models/Transaction');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// System prompt for financial coach persona
const SYSTEM_PROMPT = `You are a helpful personal finance coach assistant. You help users manage their budget, track expenses, and give financial advice. 
Be friendly, encouraging, and provide practical tips. Keep responses concise (2-3 sentences max unless asked for details).
You can analyze spending patterns and suggest ways to save money.`;

// Chat with AI
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Get user's recent transactions for context
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 });
      
    console.log(`Found ${transactions.length} transactions for user:`, transactions.map(t => `€${t.amount} ${t.type} ${t.category}`));

    // Calculate total expenses
    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Build context with ALL transaction details
    const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expensesByCategory = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount;
        return acc;
      }, {});

    let contextMessage = '';
    if (transactions.length > 0) {
      contextMessage = `User has ${transactions.length} transactions. Income: €${totalIncome} (${transactions.filter(t => t.type === 'income').length} transactions). Expenses: €${totalExpenses} (${transactions.filter(t => t.type === 'expense').length} transactions). `;
      if (Object.keys(expensesByCategory).length > 0) {
        contextMessage += `Expense categories: ${Object.entries(expensesByCategory).map(([cat, amount]) => `${cat} €${amount}`).join(', ')}.`;
      }
    } else {
      contextMessage = 'User has no transactions yet.';
    }
    
    console.log('Context sent to AI:', contextMessage);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "system", content: contextMessage },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      message: aiResponse,
      context: {
        totalExpenses,
        transactionCount: transactions.length
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

module.exports = { chat };