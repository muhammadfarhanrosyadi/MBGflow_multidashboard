/**
 * reportService.js
 * Generic date-range filter helper for Knex query builders.
 *
 * Supports:
 *   daily   — today only
 *   monthly — current calendar month
 *   yearly  — current calendar year
 *   custom  — explicit startDate + endDate (YYYY-MM-DD)
 */

/**
 * Apply a date filter to a Knex query builder.
 *
 * @param {import('knex').Knex.QueryBuilder} query - Knex query builder instance
 * @param {string} reportType - 'daily' | 'monthly' | 'yearly' | 'custom'
 * @param {string|null} startDate - ISO date string (required for custom)
 * @param {string|null} endDate   - ISO date string (required for custom)
 * @param {string} dateColumn     - Column name to filter on (e.g. 'created_at')
 * @returns {import('knex').Knex.QueryBuilder} Modified query builder
 */
function generateDateFilter(query, reportType, startDate, endDate, dateColumn = 'created_at') {
  const now = new Date();

  switch (reportType) {
    case 'daily': {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      return query.whereBetween(dateColumn, [start, end]);
    }

    case 'monthly': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return query.whereBetween(dateColumn, [start, end]);
    }

    case 'yearly': {
      const start = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      const end   = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      return query.whereBetween(dateColumn, [start, end]);
    }

    case 'custom': {
      if (startDate && endDate) {
        const start = new Date(startDate + 'T00:00:00');
        const end   = new Date(endDate   + 'T23:59:59');
        return query.whereBetween(dateColumn, [start, end]);
      }
      return query;
    }

    default:
      return query; // No filter — return all
  }
}

/**
 * Parse report filter params from Express req.query
 *
 * @param {Object} query - req.query
 * @returns {{ reportType: string|null, startDate: string|null, endDate: string|null }}
 */
function parseReportParams(query) {
  const { reportType = null, startDate = null, endDate = null } = query;
  const validTypes = ['daily', 'monthly', 'yearly', 'custom'];
  return {
    reportType: validTypes.includes(reportType) ? reportType : null,
    startDate:  startDate || null,
    endDate:    endDate   || null,
  };
}

module.exports = { generateDateFilter, parseReportParams };
