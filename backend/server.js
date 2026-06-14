const express = require('express');
const cors = require('cors');
const aiRoutes        = require('./routes/ai');
const financeRoutes   = require('./routes/finance');
const employeeRoutes  = require('./routes/employees');
const dashboardRoutes = require('./routes/dashboard');
const moduleRoutes    = require('./routes/modules');
const authRoutes      = require('./routes/auth');

const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/ai',        aiRoutes);
app.use('/api/finance',   financeRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/modules',   moduleRoutes);
app.use('/api/auth',      authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ SCM Master Admin Backend berjalan di http://localhost:${PORT}`);
  console.log(`   → GET  /api/dashboard`);
  console.log(`   → GET  /api/modules/produksi`);
  console.log(`   → GET  /api/modules/bahan-baku`);
  console.log(`   → GET  /api/modules/menu-planning`);
  console.log(`   → GET  /api/modules/logistik`);
  console.log(`   → GET  /api/modules/tracking`);
  console.log(`   → GET  /api/finance/approvals`);
  console.log(`   → POST /api/finance/approvals/:id`);
  console.log(`   → GET  /api/finance/cashflow`);
  console.log(`   → GET  /api/employees/kitchen/:kitchenId`);
});
