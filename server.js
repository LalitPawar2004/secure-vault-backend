// server.js

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const connectDB = require('./config/db');

// Load environment variables
dotenv.config();

// Connect to database
connectDB();

const app = express();

// =======================
// 🔐 SECURITY MIDDLEWARE
// =======================

// Secure HTTP headers
app.use(helmet());

// Body parser
app.use(express.json());

// Cookie parser (only needed if using JWT in cookies)
app.use(cookieParser());

// =======================
// 🌍 CORS CONFIGURATION
// =======================

const allowedOrigins = [
  'http://localhost:3000',
  'https://secure-vault-frontend-one.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);

      if (!allowedOrigins.includes(origin)) {
        return callback(
          new Error('CORS policy does not allow this origin'),
          false
        );
      }

      return callback(null, true);
    },
    credentials: true
  })
);

// =======================
// 🚦 RATE LIMITING
// =======================

// Global rate limiter
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP
  standardHeaders: true,
  legacyHeaders: false
});

app.use(globalLimiter);

// Stricter limiter for auth routes (prevents brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  }
});

// =======================
// 📂 ROUTES
// =======================

const authRoutes = require('./routes/authRoutes');
const vaultRoutes = require('./routes/vaultRoutes');

// Apply stricter limiter only to auth routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/vault', vaultRoutes);

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Secure Vault Backend is running!' });
});

// =======================
// ❌ ERROR HANDLING
// =======================

// Central error handler
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(500).json({
    success: false,
    message:
      process.env.NODE_ENV === 'production'
        ? 'Something went wrong!'
        : err.message
  });
});

// =======================
// 🚀 SERVER START
// =======================

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error(`Unhandled Rejection: ${err.message}`);
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(`Uncaught Exception: ${err.message}`);
  process.exit(1);
});
