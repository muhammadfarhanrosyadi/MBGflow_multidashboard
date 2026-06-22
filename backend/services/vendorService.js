const repo = require('../repositories/vendorRepository');
const { parseReportParams } = require('./reportService');

// ── Service Layer ─────────────────────────────────────────────────────────────
// Wraps the repository, enforces business rules, normalises errors.

/**
 * List all vendors with optional filters.
 */
async function listVendors(query) {
  const { reportType, startDate, endDate } = parseReportParams(query);
  const { approval_status } = query;
  return repo.findAll({ approval_status, reportType, startDate, endDate });
}

/**
 * List pending vendors only.
 */
async function listPendingVendors() {
  return repo.findPending();
}

/**
 * Get dashboard widget stats.
 */
async function getVendorStats() {
  return repo.getStats();
}

/**
 * Get vendor by ID. Throws 404 if not found.
 */
async function getVendorById(id) {
  const vendor = await repo.findById(id);
  if (!vendor) {
    const err = new Error('Vendor tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  return vendor;
}

/**
 * Create a new vendor. Validates DTO.
 */
async function createVendor(dto, userId) {
  const { valid, errors } = repo.validateVendorDTO(dto, false);
  if (!valid) {
    const err = new Error(errors.join(', '));
    err.statusCode = 400;
    throw err;
  }
  return repo.create({ ...dto, created_by: userId });
}

/**
 * Update an existing vendor. Validates DTO.
 */
async function updateVendor(id, dto) {
  const existing = await repo.findById(id);
  if (!existing) {
    const err = new Error('Vendor tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }

  const { valid, errors } = repo.validateVendorDTO(dto, true);
  if (!valid) {
    const err = new Error(errors.join(', '));
    err.statusCode = 400;
    throw err;
  }

  return repo.update(id, dto);
}

/**
 * Delete a vendor.
 */
async function deleteVendor(id) {
  const existing = await repo.findById(id);
  if (!existing) {
    const err = new Error('Vendor tidak ditemukan');
    err.statusCode = 404;
    throw err;
  }
  await repo.remove(id);
}

/**
 * Approve a vendor. Only super_admin or procurement may call this.
 */
async function approveVendor(id, userId, notes) {
  return repo.approve(id, userId, notes);
}

/**
 * Reject a vendor. Only super_admin or procurement may call this.
 */
async function rejectVendor(id, userId, reason, notes) {
  return repo.reject(id, userId, reason, notes);
}

/**
 * Get approval audit logs for a vendor.
 */
async function getVendorLogs(id) {
  // Verify vendor exists first
  await getVendorById(id);
  return repo.getLogs(id);
}

module.exports = {
  listVendors,
  listPendingVendors,
  getVendorStats,
  getVendorById,
  createVendor,
  updateVendor,
  deleteVendor,
  approveVendor,
  rejectVendor,
  getVendorLogs,
};
