const OpenAI = require('openai');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Enhanced system prompt for more detailed financial coaching
const SYSTEM_PROMPT = `You are an expert personal finance coach and advisor. You provide detailed, actionable financial advice with specific recommendations.

CONVERSATION STYLE:
- Be conversational and ask follow-up questions
- Provide step-by-step guidance and plans
- Ask about subscriptions, recurring expenses, and spending habits
- Give specific budget allocations and savings strategies
- Be encouraging but realistic about financial goals

WHEN ANALYZING SPENDING:
- Break down expenses by category with percentages
- Identify the biggest spending areas
- Suggest specific amounts to save in each category
- Ask clarifying questions about spending habits
- Provide a concrete action plan

ALWAYS:
- Give detailed responses (4-6 sentences minimum)
- Include specific dollar/euro amounts when giving advice
- Ask relevant follow-up questions to understand their situation better
- Provide actionable next steps`;

// Chat with AI
const chat = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user._id;

    // Get user's recent transactions for context
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 });
      
    console.log(`Found ${transactions.length} transactions for user:`, transactions.map(t => `€${t.amount} ${t.type} ${t.category}`));

    // Get user info for salary (fetch fresh from database)
    const user = await User.findById(userId);
    const userSalary = user.salary || 0;
    
    // Calculate totals
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalTransactionIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = userSalary + totalTransactionIncome;
    
    console.log(`User salary: €${userSalary}, Transaction income: €${totalTransactionIncome}, Total income: €${totalIncome}, Total expenses: €${totalExpenses}`);

    // Build detailed context message
    let contextMessage = '';
    let expensesByCategory = {};
    
    if (transactions.length > 0 || userSalary > 0) {
      contextMessage = `FINANCIAL OVERVIEW: User has monthly salary of €${userSalary}`;
      
      if (totalTransactionIncome > 0) {
        contextMessage += ` plus €${totalTransactionIncome} additional income`;
      }
      
      contextMessage += ` for total income of €${totalIncome}. `;
      
      if (totalExpenses > 0) {
        contextMessage += `Total expenses: €${totalExpenses}. Available funds: €${totalIncome - totalExpenses}. `;
        
        // Add expense breakdown by category
        expensesByCategory = transactions
          .filter(t => t.type === 'expense')
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {});
        
        if (Object.keys(expensesByCategory).length > 0) {
          contextMessage += `Expense breakdown: ${Object.entries(expensesByCategory)
            .map(([cat, amount]) => `${cat} €${amount} (${((amount/totalExpenses)*100).toFixed(0)}%)`)
            .join(', ')}. `;
        }
      } else {
        contextMessage += `No expenses recorded yet. Available funds: €${totalIncome}. `;
      }
      
      contextMessage += `Total transactions: ${transactions.length}.`;
    } else {
      contextMessage = 'User has not provided salary information or recorded any transactions yet.';
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
      max_tokens: 300
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      message: aiResponse,
      context: {
        totalIncome,
        totalExpenses,
        available: totalIncome - totalExpenses,
        transactionCount: transactions.length,
        expensesByCategory
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

module.exports = { chat };