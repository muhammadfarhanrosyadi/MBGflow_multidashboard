// ── Environment Variables (MUST be first) ─────────────────────────────────────
require('dotenv').config();

// ── TypeScript support (enables require() of .ts files) ────────────────────────
require('ts-node').register({ transpileOnly: true, esm: false });

const express = require('express');
const cors    = require('cors');

const aiRoutes           = require('./routes/ai');
const financeRoutes      = require('./routes/finance');
const employeeRoutes     = require('./routes/employees');
const dashboardRoutes    = require('./routes/dashboard');
const moduleRoutes       = require('./routes/modules');
const authRoutes         = require('./routes/auth');
const searchRoutes       = require('./routes/search');
const notificationRoutes = require('./routes/notifications');
const vendorRoutes       = require('./routes/vendors');

const app  = express();
const PORT = process.env.PORT || 5000;

// ── CORS ───────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map(s => s.trim())
  : ['http://localhost:5173', 'http://localhost:3000'];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, server-to-server)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin ${origin} not allowed`), false);
  },
  credentials: true,
}));

app.use(express.json({ limit: '5mb' }));

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/ai',            aiRoutes);
app.use('/api/finance',       financeRoutes);
app.use('/api/employees',     employeeRoutes);
app.use('/api/dashboard',     dashboardRoutes);
app.use('/api/modules',       moduleRoutes);
app.use('/api/auth',          authRoutes);
app.use('/api/search',        searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vendors',       vendorRoutes);

// ── Health check ───────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({
    success:   true,
    status:    'ok',
    timestamp: new Date().toISOString(),
    env:       process.env.NODE_ENV || 'development',
  });
});

// ── 404 handler ────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan.' });
});

// ── Global error handler ───────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error('[GlobalError]', err.message || err);
  const status = err.statusCode || err.status || 500;
  res.status(status).json({
    success: false,
    message: err.message || 'Terjadi kesalahan internal server.',
    errors:  process.env.NODE_ENV === 'development' ? [err.stack] : [],
  });
});

// ── Start server ───────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ SCM Master Admin Backend berjalan di http://localhost:${PORT}`);
  console.log(`   ENV: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   CORS origins: ${allowedOrigins.join(', ')}`);
});
