import api from './api';

/**
 * Get administrator statistics dashboard details
 * @returns {Promise<object>} Response data containing totalUsers, activeMembers, pendingSubmissions, and revenueTotal
 */
export async function getStats() {
  const response = await api.get('/admin/stats');
  return response.data;
}

/**
 * Get list of all registered users on the system
 * @param {object} params Query parameters
 * @param {string} [params.search] Search query matching names/emails
 * @param {string} [params.role] Specific role filter
 * @returns {Promise<object>} Response data containing users array
 */
export async function getUsers(params = {}) {
  const response = await api.get('/admin/users', { params });
  return response.data;
}

/**
 * Update user role privileges
 * @param {string} id User ID
 * @param {string} role User role value (MEMBER, STUDENT_MEMBER, EDITOR, EVENT_MANAGER, ADMIN, SUPER_ADMIN)
 * @returns {Promise<object>} Response data
 */
export async function updateUserRole(id, role) {
  const response = await api.patch(`/admin/users/${id}/role`, { role });
  return response.data;
}

/**
 * Fetch system audit logs details
 * @returns {Promise<object>} Response data containing auditLogs array
 */
export async function getAuditLogs() {
  const response = await api.get('/admin/audit-logs');
  return response.data;
}

/**
 * Fetch all events (including drafts) for admin panel management
 * @returns {Promise<object>} Response data containing events array
 */
export async function getAdminEvents() {
  const response = await api.get('/admin/events');
  return response.data;
}
