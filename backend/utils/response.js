/**
 * backend/utils/response.js
 * Standard API response helpers — use these in ALL route handlers.
 *
 * Format:
 *   Success: { success: true,  message, data, meta }
 *   Error:   { success: false, message, errors }
 */

/**
 * Send a standardized success response.
 * @param {import('express').Response} res
 * @param {*} data
 * @param {string} [message='Berhasil']
 * @param {object} [meta={}]
 * @param {number} [statusCode=200]
 */
function successResponse(res, data = null, message = 'Berhasil', meta = {}, statusCode = 200) {
  const body = { success: true, message };
  if (data !== undefined && data !== null) body.data = data;
  if (meta && Object.keys(meta).length > 0) body.meta = meta;
  return res.status(statusCode).json(body);
}

/**
 * Send a standardized error response.
 * @param {import('express').Response} res
 * @param {string} [message='Terjadi kesalahan.']
 * @param {number} [statusCode=500]
 * @param {Array}  [errors=[]]
 */
function errorResponse(res, message = 'Terjadi kesalahan.', statusCode = 500, errors = []) {
  const body = { success: false, message };
  if (errors && errors.length > 0) body.errors = errors;
  return res.status(statusCode).json(body);
}

/**
 * Send a 404 Not Found response.
 * @param {import('express').Response} res
 * @param {string} [entity='Data']
 */
function notFoundResponse(res, entity = 'Data') {
  return errorResponse(res, `${entity} tidak ditemukan.`, 404);
}

/**
 * Send a 400 Bad Request response.
 * @param {import('express').Response} res
 * @param {string} [message='Request tidak valid.']
 * @param {Array}  [errors=[]]
 */
function badRequestResponse(res, message = 'Request tidak valid.', errors = []) {
  return errorResponse(res, message, 400, errors);
}

/**
 * Send a 403 Forbidden response.
 * @param {import('express').Response} res
 * @param {string} [message='Akses ditolak.']
 */
function forbiddenResponse(res, message = 'Akses ditolak.') {
  return errorResponse(res, message, 403);
}

/**
 * Send a 401 Unauthorized response.
 */
function unauthorizedResponse(res, message = 'Tidak terautentikasi.') {
  return errorResponse(res, message, 401);
}

module.exports = {
  successResponse,
  errorResponse,
  notFoundResponse,
  badRequestResponse,
  forbiddenResponse,
  unauthorizedResponse,
};
