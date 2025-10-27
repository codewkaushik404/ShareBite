const express = require('express');
const cors = require('cors');
const path = require('path');
const rateLimit = require('express-rate-limit');
const cookieParser = require("cookie-parser");
// Load environment variables from src/.env explicitly
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const ngoAuthRoutes = require('./routes/ngoAuthRoutes');
const foodListingRoutes = require('./routes/foodListingRoutes');
const passport = require('passport');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(passport.initialize());

// Load rate limiter configuration from environment variables
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000; // Default: 15 minutes
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 100; // Default: 100 requests per window
const AUTH_RATE_LIMIT_MAX = parseInt(process.env.AUTH_RATE_LIMIT_MAX) || 5; // Default: 5 requests per window

// Global API rate limiter
const apiLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth-specific rate limiter
const authLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS,
  max: AUTH_RATE_LIMIT_MAX,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global rate limiter to all API routes
app.use('/api', apiLimiter);

// Apply auth-specific rate limiter to auth routes
app.use('/api/auth', authLimiter);

// Example route
app.get('/', (req, res) => {
  res.send('API is running');
});

// TODO: Add your routes here
app.use('/api/auth', authRoutes);
app.use('/api/ngo', ngoAuthRoutes);
app.use('/api/food', foodListingRoutes);

const PORT = process.env.PORT || 5000;

// Start server first
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
}).on('error', (err) => {
  console.error('❌ Server error:', err);
  process.exit(1);
});

// Connect to DB after server starts
connectDB();
