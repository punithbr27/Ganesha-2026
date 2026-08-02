const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey_ganesha2026';

// Middleware
app.use(cors());
app.use(helmet());
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', apiLimiter);

// Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Access denied' });
  
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// --- AUTH ROUTES ---
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await prisma.admin.findUnique({ where: { username } });
    if (!admin) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const validPassword = await bcrypt.compare(password, admin.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ username: admin.username }, JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, username: admin.username });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Setup Initial Admin Endpoint (for first time setup only)
app.post('/api/auth/setup', async (req, res) => {
  const { username, password } = req.body;
  try {
    const existing = await prisma.admin.findUnique({ where: { username } });
    if (existing) return res.status(400).json({ error: 'Admin already exists' });
    
    const password_hash = await bcrypt.hash(password, 10);
    await prisma.admin.create({
      data: { username, password_hash }
    });
    res.json({ message: 'Admin created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// --- MEMBERS ROUTES ---
app.get('/api/members', authenticateToken, async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: {
        collections: true
      },
      orderBy: { id: 'asc' }
    });
    // calculate total collected
    const enriched = members.map(m => {
      const total_collected = m.collections.reduce((sum, c) => sum + c.amount, 0);
      const last_collection = m.collections.length > 0 
        ? m.collections.sort((a,b) => b.collection_date - a.collection_date)[0].collection_date 
        : null;
      return { ...m, total_collected, last_collection };
    });
    res.json(enriched);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching members' });
  }
});

app.post('/api/members', authenticateToken, async (req, res) => {
  const { member_name, phone_number } = req.body;
  if (!member_name) return res.status(400).json({ error: 'Member name is required' });
  try {
    const member = await prisma.member.create({
      data: { member_name, phone_number }
    });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Error creating member' });
  }
});

app.put('/api/members/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const { member_name, phone_number } = req.body;
  try {
    const member = await prisma.member.update({
      where: { id },
      data: { member_name, phone_number }
    });
    res.json(member);
  } catch (error) {
    res.status(500).json({ error: 'Error updating member' });
  }
});

app.delete('/api/members/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    // Delete related collections first
    await prisma.dailyCollection.deleteMany({ where: { member_id: id } });
    await prisma.member.delete({ where: { id } });
    res.json({ message: 'Member deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting member' });
  }
});

// --- COLLECTIONS ROUTES ---
app.get('/api/collections', authenticateToken, async (req, res) => {
  try {
    const collections = await prisma.dailyCollection.findMany({
      include: { member: true },
      orderBy: { collection_date: 'desc' }
    });
    res.json(collections);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching collections' });
  }
});

app.post('/api/collections', authenticateToken, async (req, res) => {
  const { member_id, collection_date, amount, remarks } = req.body;
  if (!member_id || amount < 0 || !collection_date) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  try {
    const collection = await prisma.dailyCollection.create({
      data: {
        member_id: parseInt(member_id),
        collection_date: new Date(collection_date),
        amount: parseFloat(amount),
        remarks
      },
      include: { member: true }
    });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Error creating collection' });
  }
});

app.put('/api/collections/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const { amount, collection_date, remarks } = req.body;
  try {
    const collection = await prisma.dailyCollection.update({
      where: { id },
      data: {
        amount: parseFloat(amount),
        collection_date: new Date(collection_date),
        remarks
      }
    });
    res.json(collection);
  } catch (error) {
    res.status(500).json({ error: 'Error updating collection' });
  }
});

app.delete('/api/collections/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.dailyCollection.delete({ where: { id } });
    res.json({ message: 'Collection deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting collection' });
  }
});

// --- EXPENSES ROUTES ---
app.get('/api/expenses', authenticateToken, async (req, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      orderBy: { expense_date: 'desc' }
    });
    res.json(expenses);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching expenses' });
  }
});

app.post('/api/expenses', authenticateToken, async (req, res) => {
  const { expense_date, title, amount, description } = req.body;
  if (!title || amount < 0 || !expense_date) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  try {
    const expense = await prisma.expense.create({
      data: {
        expense_date: new Date(expense_date),
        title,
        amount: parseFloat(amount),
        description
      }
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Error creating expense' });
  }
});

app.put('/api/expenses/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  const { expense_date, title, amount, description } = req.body;
  try {
    const expense = await prisma.expense.update({
      where: { id },
      data: {
        expense_date: new Date(expense_date),
        title,
        amount: parseFloat(amount),
        description
      }
    });
    res.json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Error updating expense' });
  }
});

app.delete('/api/expenses/:id', authenticateToken, async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await prisma.expense.delete({ where: { id } });
    res.json({ message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting expense' });
  }
});

// --- REPORTS / DASHBOARD ROUTES ---
app.get('/api/reports/dashboard', authenticateToken, async (req, res) => {
  try {
    const collections = await prisma.dailyCollection.findMany();
    const expenses = await prisma.expense.findMany();
    const membersCount = await prisma.member.count();

    const totalCollection = collections.reduce((acc, c) => acc + c.amount, 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
    
    // Today's boundaries
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const todaysCollection = collections
      .filter(c => c.collection_date >= startOfToday && c.collection_date <= endOfToday)
      .reduce((acc, c) => acc + c.amount, 0);
      
    const todaysExpenses = expenses
      .filter(e => e.expense_date >= startOfToday && e.expense_date <= endOfToday)
      .reduce((acc, e) => acc + e.amount, 0);

    res.json({
      totalCollection,
      totalExpenses,
      currentBalance: totalCollection - totalExpenses,
      totalMembers: membersCount,
      todaysCollection,
      todaysExpenses
    });
  } catch (error) {
    res.status(500).json({ error: 'Error generating report' });
  }
});

// Top Contributors
app.get('/api/reports/top-contributors', authenticateToken, async (req, res) => {
  try {
    const members = await prisma.member.findMany({
      include: { collections: true }
    });
    const contributors = members.map(m => {
      const total = m.collections.reduce((sum, c) => sum + c.amount, 0);
      return { id: m.id, name: m.member_name, total };
    });
    contributors.sort((a, b) => b.total - a.total);
    res.json(contributors.slice(0, 5)); // top 5
  } catch (error) {
    res.status(500).json({ error: 'Error fetching top contributors' });
  }
});

if (process.env.NODE_ENV !== 'production' || require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
