import express from 'express';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

const DEFAULT_BUDGETS = {
  'Food & Dining': 5000,
  'Shopping': 3000,
  'Transportation': 2000,
  'Bills & Utilities': 4000,
  'Entertainment': 1500,
  'Health & Fitness': 1000,
  'Travel': 2500,
  'Groceries': 5000,
  'Education': 2000,
  'Other': 1000
};

router.get('/', async (req, res) => {
  try {
    const now = new Date();
    const month = req.query.month ? parseInt(req.query.month) : now.getMonth() + 1;
    const year = req.query.year ? parseInt(req.query.year) : now.getFullYear();
    
    const budgets = await prisma.budget.findMany({
      where: {
        userId: req.user.userId,
        month,
        year
      }
    });
    
    if (budgets.length === 0) {
      const defaultBudgetsArray = Object.entries(DEFAULT_BUDGETS).map(([category, limit]) => ({
        category,
        limit,
        month,
        year
      }));
      return res.json({ budgets: defaultBudgetsArray });
    }
    
    res.json({ budgets });
  } catch (error) {
    console.error('Error fetching budgets:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.put('/', async (req, res) => {
  try {
    const { budgets, month, year } = req.body;
    
    if (!budgets || !Array.isArray(budgets)) {
      return res.status(400).json({ error: 'Budgets array is required' });
    }

    const now = new Date();
    const targetMonth = month ? parseInt(month) : now.getMonth() + 1;
    const targetYear = year ? parseInt(year) : now.getFullYear();
    
    const updatedBudgets = [];
    
    for (const b of budgets) {
      const { category, limit } = b;
      if (!category) continue;
      
      const parsedLimit = parseFloat(limit);
      const safeLimit = isNaN(parsedLimit) ? 0 : parsedLimit;
      
      const upserted = await prisma.budget.upsert({
        where: {
          userId_category_month_year: {
            userId: req.user.userId,
            category,
            month: targetMonth,
            year: targetYear
          }
        },
        update: {
          limit: safeLimit
        },
        create: {
          category,
          limit: safeLimit,
          month: targetMonth,
          year: targetYear,
          userId: req.user.userId
        }
      });
      updatedBudgets.push(upserted);
    }
    
    res.json({ budgets: updatedBudgets });
  } catch (error) {
    console.error('Error updating budgets:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
