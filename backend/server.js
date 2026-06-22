// ── TypeScript support (must be FIRST — enables require() of .ts files) ───────
require('ts-node').register({ transpileOnly: true, esm: false });

const express = require('express');
const cors = require('cors');

const aiRoutes = require('./routes/ai');
const financeRoutes = require('./routes/finance');
const employeeRoutes = require('./routes/employees');
const dashboardRoutes = require('./routes/dashboard');
const moduleRoutes = require('./routes/modules');
const authRoutes = require('./routes/auth');
const searchRoutes = require('./routes/search');
const notificationRoutes = require('./routes/notifications');
const vendorRoutes = require('./routes/vendors');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai', aiRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/modules', moduleRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/vendors', vendorRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Global error middleware ────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[GlobalError]', err);
  const status = err.statusCode || 500;
  res.status(status).json({ success: false, message: err.message || 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ SCM Master Admin Backend berjalan di http://localhost:${PORT}`);
  console.log(`   → GET  /api/dashboard`);
  console.log(`   → GET  /api/ai/history/:module_name  (inventory|production|distribution|finance|employee)`);
  console.log(`   → POST /api/ai/history`);
  console.log(`   → GET  /api/ai/history/export/:module_name?format=xlsx|pdf`);
  console.log(`   → GET  /api/finance/approvals`);
  console.log(`   → GET  /api/employees/kitchen/:kitchenId`);
  console.log(`   → GET  /api/vendors              (Vendor list)`);
  console.log(`   → GET  /api/vendors/stats         (Dashboard widget)`);
  console.log(`   → POST /api/vendors/:id/approve   (Approve vendor)`);
  console.log(`   → POST /api/vendors/:id/reject    (Reject vendor)`);
});

