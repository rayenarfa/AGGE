import api from './api';

/**
 * Fetch all published events with optional query parameters
 * @param {object} params Query parameters (type, online, upcoming, category, search)
 * @returns {Promise<object>} Response data containing events list
 */
export async function getEvents(params = {}) {
  const response = await api.get('/events', { params });
  return response.data;
}

/**
 * Fetch minimal event details for feeding the calendar
 * @returns {Promise<object>} Response data containing simple events list
 */
export async function getCalendarEvents() {
  const response = await api.get('/events/calendar');
  return response.data;
}

/**
 * Fetch details of a single event by slug
 * @param {string} slug Event url-friendly identifier
 * @returns {Promise<object>} Response data containing event and registration check flag
 */
export async function getEventBySlug(slug) {
  const response = await api.get(`/events/${slug}`);
  return response.data;
}

/**
 * Enroll/register current logged in user to the event
 * @param {string} id Event ID
 * @returns {Promise<object>} Response details
 */
export async function registerForEvent(id) {
  const response = await api.post(`/events/${id}/register`);
  return response.data;
}

/**
 * Create a new event (restricted to authorized roles)
 * @param {object} eventData Event configuration parameters
 * @returns {Promise<object>} Response details
 */
export async function createEvent(eventData) {
  const response = await api.post('/events', eventData);
  return response.data;
}

/**
 * Edit/update event configuration details (restricted to authorized roles)
 * @param {string} id Event ID
 * @param {object} eventData Update parameters
 * @returns {Promise<object>} Response details
 */
export async function updateEvent(id, eventData) {
  const response = await api.patch(`/events/${id}`, eventData);
  return response.data;
}

/**
 * Delete event (restricted to authorized roles)
 * @param {string} id Event ID
 * @returns {Promise<object>} Response message
 */
export async function deleteEvent(id) {
  const response = await api.delete(`/events/${id}`);
  return response.data;
}
