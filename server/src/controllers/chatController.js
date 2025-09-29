const OpenAI = require('openai');
const Transaction = require('../models/Transaction');
const User = require('../models/User');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


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

SPENDING PACE TRACKING:
- ALWAYS acknowledge spending pace alerts when provided
- If user is overspending, be direct but encouraging about the need to reduce spending
- Give specific daily budget targets when user is over pace
- Celebrate when user is under budget and suggest ways to save the extra money

ALWAYS:
- Give detailed responses (4-6 sentences minimum)
- Include specific euro amounts when giving advice
- Ask relevant follow-up questions to understand their situation better
- Provide actionable next steps
- Reference the user's actual data (salary, expenses, categories) in your responses`;


const chat = async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;
    const userId = req.user._id;

    // helps get user's recent transactions for context
    const transactions = await Transaction.find({ userId })
      .sort({ date: -1 });
      
    console.log(`Found ${transactions.length} transactions for user`);

    // helps get user info for salary (fetch fresh from database)
    const user = await User.findById(userId);
    const userSalary = user.salary || 0;
    
    // helps calculate totals
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    const totalTransactionIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const totalIncome = userSalary + totalTransactionIncome;
    
    console.log(`Income: €${totalIncome}, Expenses: €${totalExpenses}`);

    // helps calculate spending pace based on date
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const dayOfMonth = today.getDate();
    const daysRemaining = daysInMonth - dayOfMonth;
    
    const dailyBudget = totalIncome / daysInMonth;
    const shouldHaveSpent = dailyBudget * dayOfMonth;
    const remainingBudget = totalIncome - totalExpenses;
    const dailyBudgetRemaining = daysRemaining > 0 ? remainingBudget / daysRemaining : 0;
    const burnRate = dayOfMonth > 0 ? (totalExpenses / dayOfMonth) * daysInMonth : 0;
    
    // helps build spending pace alert
    let spendingPaceStatus = '';
    if (totalExpenses > shouldHaveSpent) {
      const overBy = totalExpenses - shouldHaveSpent;
      const percentOver = ((overBy / shouldHaveSpent) * 100).toFixed(0);
      spendingPaceStatus = `⚠️ SPENDING PACE ALERT ⚠️
        User is on day ${dayOfMonth} of ${daysInMonth} (${daysRemaining} days remaining).
        Expected spending by now: €${shouldHaveSpent.toFixed(2)}
        Actual spending: €${totalExpenses.toFixed(2)}
        OVERSPENDING by €${overBy.toFixed(2)} (${percentOver}% over pace)
        Projected month-end spending at current rate: €${burnRate.toFixed(2)}
        Remaining daily budget to get back on track: €${dailyBudgetRemaining.toFixed(2)}/day

        ACTION REQUIRED: User needs to reduce spending significantly to avoid exceeding budget.`;
    } else {
      const underBy = shouldHaveSpent - totalExpenses;
      spendingPaceStatus = `✅ SPENDING PACE: ON TRACK
        User is on day ${dayOfMonth} of ${daysInMonth} (${daysRemaining} days remaining).
        Expected spending: €${shouldHaveSpent.toFixed(2)}
        Actual spending: €${totalExpenses.toFixed(2)}
        Under budget by: €${underBy.toFixed(2)}
        Remaining daily budget: €${dailyBudgetRemaining.toFixed(2)}/day for next ${daysRemaining} days

        GREAT JOB: User is managing budget well!`;
    }

    // helps build detailed context message
    let contextMessage = '';
    let expensesByCategory = {};
    
    if (transactions.length > 0 || userSalary > 0) {
      contextMessage = `📊 FINANCIAL OVERVIEW:
        Monthly salary: €${userSalary}`;
      
      if (totalTransactionIncome > 0) {
        contextMessage += `
        Additional income: €${totalTransactionIncome}`;
      }
      
      contextMessage += `
        Total monthly income: €${totalIncome}
        Total expenses: €${totalExpenses}
        Available funds: €${remainingBudget.toFixed(2)}

${spendingPaceStatus}`;
      
      if (totalExpenses > 0) {
        
        expensesByCategory = transactions
          .filter(t => t.type === 'expense')
          .reduce((acc, t) => {
            acc[t.category] = (acc[t.category] || 0) + t.amount;
            return acc;
          }, {});
        
        if (Object.keys(expensesByCategory).length > 0) {
          contextMessage += `

            💰 EXPENSE BREAKDOWN BY CATEGORY:`;
          
          
          const sortedCategories = Object.entries(expensesByCategory)
            .sort(([,a], [,b]) => b - a);
          
          sortedCategories.forEach(([cat, amount]) => {
            const percentage = ((amount/totalExpenses)*100).toFixed(0);
            contextMessage += `
            - ${cat}: €${amount.toFixed(2)} (${percentage}% of total spending)`;
          });
          
          
          const biggestCategory = sortedCategories[0];
          contextMessage += `

            🎯 BIGGEST SPENDING AREA: ${biggestCategory[0]} at €${biggestCategory[1].toFixed(2)}`;
        }
      }
      
      contextMessage += `

        📝 Total transactions recorded: ${transactions.length}`;
    } else {
      contextMessage = `📊 FINANCIAL OVERVIEW:
        User has not provided salary information or recorded any transactions yet.
        Ask user to provide their monthly salary and start tracking expenses.`;
    }
    
    console.log('Context sent to AI:\n', contextMessage);

    // Build messages array with conversation history
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "system", content: contextMessage }
    ];
    
    // this adds conversation history if provided (last 5 messages to stay within token limits)
    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-5);
      messages.push(...recentHistory);
    }
    
    // this adds current user message
    messages.push({ role: "user", content: message });

    // call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: messages,
      temperature: 0.7,
      max_tokens: 400 //good enough for such a bot
    });

    const aiResponse = completion.choices[0].message.content;

    res.json({
      message: aiResponse,
      context: {
        totalIncome,
        totalExpenses,
        available: remainingBudget,
        transactionCount: transactions.length,
        expensesByCategory,
        spendingPace: {
          dayOfMonth,
          daysInMonth,
          daysRemaining,
          shouldHaveSpent: shouldHaveSpent.toFixed(2),
          actualSpent: totalExpenses.toFixed(2),
          isOverBudget: totalExpenses > shouldHaveSpent,
          dailyBudgetRemaining: dailyBudgetRemaining.toFixed(2),
          projectedMonthEnd: burnRate.toFixed(2)
        }
      }
    });

  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
};

module.exports = { chat };