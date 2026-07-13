import api from './api';

/**
 * Update current user profile details
 * @param {object} profileData
 * @param {string} [profileData.firstName]
 * @param {string} [profileData.lastName]
 * @param {string} [profileData.email]
 * @returns {Promise<object>} Response data
 */
export async function updateProfile(profileData) {
  const response = await api.put('/users/profile', profileData);
  return response.data;
}

/**
 * Update current user password
 * @param {object} passwordData
 * @param {string} passwordData.currentPassword
 * @param {string} passwordData.newPassword
 * @returns {Promise<object>} Response data
 */
export async function updatePassword(passwordData) {
  const response = await api.put('/users/profile/password', passwordData);
  return response.data;
}

/**
 * Get aggregated dashboard data for the authenticated member
 * @returns {Promise<object>} Response data
 */
export async function getDashboard() {
  const response = await api.get('/users/dashboard');
  return response.data;
}
