import api from './api';

/**
 * Fetch all available membership plans
 * @returns {Promise<object>} List of plans
 */
export async function getMembershipPlans() {
  const response = await api.get('/payments/plans');
  return response.data;
}

/**
 * Initialize checkout session
 * @param {string} type Target checkout type (MEMBERSHIP, EVENT, COURSE)
 * @param {string} targetId Database ID of the target plan/event/course
 * @returns {Promise<object>} Checkout details
 */
export async function createCheckoutSession(type, targetId) {
  const response = await api.post('/payments/checkout-session', { type, targetId });
  return response.data;
}

/**
 * Send simulated webhook notification to the backend
 * @param {string} sessionId Checkout Payment ID
 * @param {string} status Transaction outcome status (SUCCESS, FAIL)
 * @returns {Promise<object>} Status result
 */
export async function simulatedWebhook(sessionId, status) {
  const response = await api.post('/payments/webhook', { sessionId, status });
  return response.data;
}

/**
 * Fetch specific payment session details
 * @param {string} id Payment ID
 * @returns {Promise<object>} Session details
 */
export async function getPaymentSession(id) {
  const response = await api.get(`/payments/session/${id}`);
  return response.data;
}

/**
 * Fetch all payment histories (restricted to Admins)
 * @returns {Promise<object>} Transactions array
 */
export async function getAdminPayments() {
  const response = await api.get('/payments/admin/payments');
  return response.data;
}

/**
 * Update pricing/descriptions of a membership plan (restricted to Admins)
 * @param {string} id Plan ID
 * @param {number} price Price tag
 * @param {string} description Plan description
 * @returns {Promise<object>} Updated record details
 */
export async function updateMembershipPlan(id, price, description) {
  const response = await api.patch(`/payments/admin/plans/${id}`, { price, description });
  return response.data;
}
