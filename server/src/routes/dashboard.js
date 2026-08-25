import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { generateMonthlyTip } from '../services/gemini.js';

const router = express.Router();

router.use(authenticate);

router.get('/summary', async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();
    
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.userId,
        date: {
          gte: startDate,
          lte: endDate
        }
      }
    });
    
    let totalIncome = 0;
    let totalExpenses = 0;
    const expensesByCategoryMap = new Map();
    
    for (const t of transactions) {
      if (t.type === 'credit') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        const current = expensesByCategoryMap.get(t.category) || 0;
        expensesByCategoryMap.set(t.category, current + t.amount);
      }
    }
    
    const spendingByCategory = Array.from(expensesByCategoryMap.entries()).map(([category, amount]) => ({
      category,
      amount
    }));
    
    const netBalance = totalIncome - totalExpenses;
    
    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user.userId,
        month,
        year
      }
    });
    
    const budgetVsActual = budgets.map(b => ({
      category: b.category,
      budget: b.limit,
      actual: expensesByCategoryMap.get(b.category) || 0
    }));
    
    let financialTip = await prisma.financialTip.findUnique({
      where: {
        userId_month_year: {
          userId: req.user.userId,
          month,
          year
        }
      }
    });
    
    if (!financialTip) {
      const summaryParts = spendingByCategory.map(s => `${s.category}: ₹${s.amount.toFixed(2)}`);
      const summaryString = summaryParts.length > 0 ? summaryParts.join(', ') : 'No expenses yet';
      
      const tipText = await generateMonthlyTip(summaryString);
      
      financialTip = await prisma.financialTip.create({
        data: {
          month,
          year,
          tip: tipText,
          userId: req.user.userId
        }
      });
    }
    
    res.json({
      spendingByCategory,
      budgetVsActual,
      totalIncome,
      totalExpenses,
      netBalance,
      tip: financialTip.tip,
      month,
      year
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
