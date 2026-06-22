const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/vendorController');
const { authenticateToken, requireRole } = require('../middleware/auth');

// ── Public-ish routes (require login, any role) ────────────────────────────
router.get('/stats',   authenticateToken, ctrl.getVendorStats);
router.get('/pending', authenticateToken, ctrl.getPendingVendors);
router.get('/export',  authenticateToken, ctrl.exportVendors);

// ── CRUD ────────────────────────────────────────────────────────────────────
router.get('/',    authenticateToken, ctrl.getAllVendors);
router.get('/:id', authenticateToken, ctrl.getVendorById);

router.post('/',    authenticateToken, requireRole('super_admin', 'procurement'), ctrl.createVendor);
router.put('/:id',  authenticateToken, requireRole('super_admin', 'procurement'), ctrl.updateVendor);
router.delete('/:id', authenticateToken, requireRole('super_admin'), ctrl.deleteVendor);

// ── Approval actions (procurement or super_admin only) ──────────────────────
router.post('/:id/approve', authenticateToken, requireRole('super_admin', 'procurement'), ctrl.approveVendor);
router.post('/:id/reject',  authenticateToken, requireRole('super_admin', 'procurement'), ctrl.rejectVendor);

// ── Audit log ──────────────────────────────────────────────────────────────
router.get('/:id/logs', authenticateToken, ctrl.getVendorLogs);

module.exports = router;
