const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { initDb } = require('./config/db');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS
app.use(cors({
  origin: '*', // Allow all origins for dev simplicity
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Request logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Database initialization state
let dbInitialized = false;
let dbInitPromise = null;

const ensureDb = async () => {
  if (dbInitialized) return;
  if (!dbInitPromise) {
    dbInitPromise = initDb().then(() => {
      dbInitialized = true;
    }).catch(err => {
      dbInitPromise = null;
      throw err;
    });
  }
  await dbInitPromise;
};

// Middleware to ensure DB is initialized before any request
app.use(async (req, res, next) => {
  try {
    await ensureDb();
    next();
  } catch (error) {
    next(error);
  }
});

// Import routes
const authRoutes = require('./routes/auth');
const contractRoutes = require('./routes/contracts');
const userRoutes = require('./routes/users');
const logRoutes = require('./routes/logs');

// Wire routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/users', userRoutes);
app.use('/api/logs', logRoutes);

// Health check endpoint
const { dbGet } = require('./config/db');
app.get('/api/health', async (req, res) => {
  try {
    const userCount = await dbGet('SELECT COUNT(*) as count FROM users');
    res.json({ 
      status: 'OK', 
      timestamp: new Date(), 
      version: '1.0.0',
      database: 'Connected',
      userCount: userCount ? userCount.count : null
    });
  } catch (error) {
    res.json({ 
      status: 'ERROR', 
      timestamp: new Date(), 
      version: '1.0.0', 
      databaseError: error.message,
      databaseStack: error.stack
    });
  }
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback wildcard handler for React Router client-side routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err.stack);
  res.status(500).json({ 
    message: 'An internal server error occurred.', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// Database startup hook

// Start server if not running on Vercel
if (!process.env.VERCEL) {
  const startServer = async () => {
    try {
      await ensureDb();
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };
  startServer();
}

module.exports = app;
