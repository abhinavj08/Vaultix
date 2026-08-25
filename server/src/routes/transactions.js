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
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59, 999);
      
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
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { date, description, amount, type } = req.body;
    
    if (!date || !description || amount === undefined || !type) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const { category } = await categorizeTransaction(description);
    
    const transaction = await prisma.transaction.create({
      data: {
        date: new Date(date),
        description,
        amount: parseFloat(amount),
        type,
        category,
        userId: req.user.userId
      }
    });
    
    res.status(201).json({ transaction });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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
          const { category } = await categorizeTransaction(t.description);
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
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    const created = await prisma.$transaction(
      batchedTransactions.map(data => prisma.transaction.create({ data }))
    );
    
    res.status(201).json({ count: created.length, transactions: created });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
