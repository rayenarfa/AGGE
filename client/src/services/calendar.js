import api from './api';

/**
 * Fetch unified event/course calendar items from the backend
 * @param {object} params Search and filter parameters
 * @returns {Promise<object>} Unified calendar items list
 */
export async function getCalendar(params) {
  const response = await api.get('/calendar', { params });
  return response.data;
}
