import express from 'express';
import multer from 'multer';
import prisma from '../lib/prisma.js';
import { authenticate } from '../middleware/auth.js';
import { categorizeTransaction } from '../services/gemini.js';
import { parseCSV } from '../utils/csvParser.js';

const router = express.Router();
const upload = multer();

router.use(authenticate);

router.get('/', async (req, res) => {
  try {
    const { month, year } = req.query;
    
    let dateFilter = {};
    if (month && year) {
      const startDate = new Date(Date.UTC(parseInt(year), parseInt(month) - 1, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(parseInt(year), parseInt(month), 0, 23, 59, 59, 999));
      
      dateFilter = {
        date: {
          gte: startDate,
          lte: endDate
        }
      };
    }
    
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: req.user.userId,
        ...dateFilter
      },
      orderBy: {
        date: 'desc'
      }
    });
    
    res.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, description, amount, type } = req.body;
    
    if (!description || amount === undefined || amount === null || !type) {
      return res.status(400).json({ error: 'Description, amount, and type are required' });
    }

    const txDate = date ? new Date(date) : new Date();
    
    let category = 'Other';
    try {
      const catResult = await categorizeTransaction(description);
      if (catResult && catResult.category) {
        category = catResult.category;
      }
    } catch (e) {
      console.error('Categorization error during transaction creation:', e);
    }
    
    const transaction = await prisma.transaction.create({
      data: {
        date: txDate,
        description: description.trim(),
        amount: parseFloat(amount),
        type,
        category,
        userId: req.user.userId
      }
    });
    
    res.status(201).json({ transaction });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const parsedTransactions = parseCSV(req.file.buffer);
    if (parsedTransactions.length === 0) {
      return res.status(400).json({ error: 'No valid transactions found in CSV' });
    }

    const batchedTransactions = [];
    const batchSize = 5;
    
    for (let i = 0; i < parsedTransactions.length; i += batchSize) {
      const batch = parsedTransactions.slice(i, i + batchSize);
      
      const results = await Promise.allSettled(
        batch.map(async (t) => {
          let category = 'Other';
          try {
            const res = await categorizeTransaction(t.description);
            if (res && res.category) category = res.category;
          } catch (err) {
            console.error('Error categorizing row:', err);
          }
          return {
            ...t,
            category,
            userId: req.user.userId
          };
        })
      );
      
      for (const result of results) {
        if (result.status === 'fulfilled') {
          batchedTransactions.push(result.value);
        }
      }
      
      if (i + batchSize < parsedTransactions.length) {
        await new Promise(resolve => setTimeout(resolve, 600));
      }
    }
    
    const created = await prisma.$transaction(
      batchedTransactions.map(data => prisma.transaction.create({ data }))
    );
    
    res.status(201).json({ count: created.length, transactions: created });
  } catch (error) {
    console.error('Error uploading statement:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        userId: req.user.userId
      }
    });
    
    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }
    
    await prisma.transaction.delete({
      where: { id }
    });
    
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting transaction:', error);
    res.status(500).json({ error: error.message || 'Internal Server Error' });
  }
});

export default router;
