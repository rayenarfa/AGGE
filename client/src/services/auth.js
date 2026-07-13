import api from './api';

/**
 * Log in a user
 * @param {string} email
 * @param {string} password
 * @returns {Promise<object>} Response data
 */
export async function login(email, password) {
  const response = await api.post('/auth/login', { email, password });
  return response.data;
}

/**
 * Register a new user
 * @param {object} userData
 * @param {string} userData.firstName
 * @param {string} userData.lastName
 * @param {string} userData.email
 * @param {string} userData.password
 * @returns {Promise<object>} Response data
 */
export async function register(userData) {
  const response = await api.post('/auth/register', userData);
  return response.data;
}

/**
 * Log out the current user
 * @returns {Promise<object>} Response data
 */
export async function logout() {
  const response = await api.post('/auth/logout');
  return response.data;
}

/**
 * Get current authenticated user profile
 * @returns {Promise<object>} Response data
 */
export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data;
}

/**
 * Refresh access tokens silently
 * @returns {Promise<object>} Response data
 */
export async function refresh() {
  const response = await api.post('/auth/refresh');
  return response.data;
}
