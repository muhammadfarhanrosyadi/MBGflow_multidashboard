const db = require('../db');
const { generateDateFilter, parseReportParams } = require('../services/reportService');

// ── DTO Validation ────────────────────────────────────────────────────────────

/**
 * Validate vendor create/update DTO.
 * Returns { valid: boolean, errors: string[] }
 */
function validateVendorDTO(body, isUpdate = false) {
  const errors = [];

  if (!isUpdate) {
    if (!body.name || String(body.name).trim() === '') errors.push('name wajib diisi');
    if (!body.email || String(body.email).trim() === '') errors.push('email wajib diisi');
  }

  if (body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
    errors.push('format email tidak valid');
  }

  if (body.approval_status) {
    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(body.approval_status)) {
      errors.push(`approval_status harus salah satu dari: ${validStatuses.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

// ── Repository Functions ──────────────────────────────────────────────────────

/**
 * Find all vendors with optional filters.
 */
async function findAll({ approval_status, reportType, startDate, endDate } = {}) {
  let query = db('suppliers')
    .leftJoin('users as approver', 'suppliers.approved_by', 'approver.id')
    .select(
      'suppliers.id',
      'suppliers.name',
      'suppliers.contact_person',
      'suppliers.phone',
      'suppliers.email',
      'suppliers.address',
      'suppliers.approval_status',
      'suppliers.approved_by',
      'suppliers.approved_at',
      'suppliers.rejection_reason',
      'suppliers.approval_notes',
      'suppliers.created_at',
      'approver.name as approver_name'
    )
    .orderBy('suppliers.created_at', 'desc');

  if (approval_status) {
    query = query.where('suppliers.approval_status', approval_status);
  }

  if (reportType) {
    query = generateDateFilter(query, reportType, startDate, endDate, 'suppliers.created_at');
  }

  return query;
}

/**
 * Find a single vendor by ID.
 */
async function findById(id) {
  return db('suppliers')
    .leftJoin('users as approver', 'suppliers.approved_by', 'approver.id')
    .where('suppliers.id', id)
    .select(
      'suppliers.id',
      'suppliers.name',
      'suppliers.contact_person',
      'suppliers.phone',
      'suppliers.email',
      'suppliers.address',
      'suppliers.approval_status',
      'suppliers.approved_by',
      'suppliers.approved_at',
      'suppliers.rejection_reason',
      'suppliers.approval_notes',
      'suppliers.created_at',
      'approver.name as approver_name'
    )
    .first();
}

/**
 * Find all pending vendors.
 */
async function findPending() {
  return findAll({ approval_status: 'pending' });
}

/**
 * Get aggregated stats: count by approval_status.
 */
async function getStats() {
  const rows = await db('suppliers')
    .select('approval_status')
    .count('id as count')
    .groupBy('approval_status');

  const stats = { total: 0, pending: 0, approved: 0, rejected: 0 };
  rows.forEach(r => {
    const count = Number(r.count);
    stats[r.approval_status] = count;
    stats.total += count;
  });

  return stats;
}

/**
 * Create a new vendor.
 */
async function create(dto) {
  return db.transaction(async trx => {
    const [id] = await trx('suppliers').insert({
      name:            dto.name,
      contact_person:  dto.contact_person || null,
      phone:           dto.phone          || null,
      email:           dto.email,
      address:         dto.address        || null,
      approval_status: 'pending',
      created_at:      new Date(),
    });

    await trx('vendor_approval_logs').insert({
      supplier_id: id,
      action:      'created',
      old_status:  null,
      new_status:  'pending',
      approved_by: dto.created_by || null,
      notes:       'Vendor baru didaftarkan.',
      created_at:  new Date(),
    });

    return findById(id);
  });
}

/**
 * Update vendor fields.
 */
async function update(id, dto) {
  const allowed = ['name', 'contact_person', 'phone', 'email', 'address'];
  const updates = {};
  allowed.forEach(f => { if (dto[f] !== undefined) updates[f] = dto[f]; });

  await db('suppliers').where('id', id).update(updates);
  return findById(id);
}

/**
 * Delete a vendor.
 */
async function remove(id) {
  return db('suppliers').where('id', id).delete();
}

/**
 * Approve a vendor (transaction: update + log).
 */
async function approve(id, userId, notes) {
  return db.transaction(async trx => {
    const vendor = await trx('suppliers').where('id', id).first();
    if (!vendor) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

    const oldStatus = vendor.approval_status;
    if (oldStatus === 'approved') {
      throw Object.assign(new Error('Vendor sudah dalam status approved'), { statusCode: 409 });
    }

    await trx('suppliers').where('id', id).update({
      approval_status: 'approved',
      approved_by:     userId,
      approved_at:     new Date(),
      rejection_reason: null,
      approval_notes:  notes || null,
    });

    await trx('vendor_approval_logs').insert({
      supplier_id: id,
      action:      'approved',
      old_status:  oldStatus,
      new_status:  'approved',
      approved_by: userId,
      notes:       notes || null,
      created_at:  new Date(),
    });

    return findById(id);
  });
}

/**
 * Reject a vendor (transaction: update + log).
 */
async function reject(id, userId, reason, notes) {
  if (!reason || String(reason).trim() === '') {
    throw Object.assign(new Error('Alasan penolakan (reason) wajib diisi'), { statusCode: 400 });
  }

  return db.transaction(async trx => {
    const vendor = await trx('suppliers').where('id', id).first();
    if (!vendor) throw Object.assign(new Error('NOT_FOUND'), { statusCode: 404 });

    const oldStatus = vendor.approval_status;

    await trx('suppliers').where('id', id).update({
      approval_status:  'rejected',
      rejection_reason: reason,
      approval_notes:   notes || null,
    });

    await trx('vendor_approval_logs').insert({
      supplier_id: id,
      action:      'rejected',
      old_status:  oldStatus,
      new_status:  'rejected',
      approved_by: userId,
      notes:       reason + (notes ? ` | ${notes}` : ''),
      created_at:  new Date(),
    });

    return findById(id);
  });
}

/**
 * Get approval audit logs for a vendor.
 */
async function getLogs(supplierId) {
  return db('vendor_approval_logs')
    .leftJoin('users', 'vendor_approval_logs.approved_by', 'users.id')
    .where('vendor_approval_logs.supplier_id', supplierId)
    .select(
      'vendor_approval_logs.id',
      'vendor_approval_logs.action',
      'vendor_approval_logs.old_status',
      'vendor_approval_logs.new_status',
      'vendor_approval_logs.notes',
      'vendor_approval_logs.created_at',
      'users.name as actor_name'
    )
    .orderBy('vendor_approval_logs.created_at', 'desc');
}

module.exports = {
  validateVendorDTO,
  findAll,
  findById,
  findPending,
  getStats,
  create,
  update,
  remove,
  approve,
  reject,
  getLogs,
};
