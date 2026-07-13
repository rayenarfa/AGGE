import api from './api';

/**
 * Fetch dynamic form configuration fields
 * @param {string} key Unique form descriptor (e.g. membership-join)
 * @returns {Promise<object>} Response data containing formDefinition
 */
export async function getFormDefinition(key) {
  const response = await api.get(`/forms/definitions/${key}`);
  return response.data;
}

/**
 * Submit dynamic form data fields values
 * @param {string} key Unique form descriptor
 * @param {string} [email] Guest email parameter if guest
 * @param {object} data Key-value pair collection of input fields
 * @returns {Promise<object>} Submission details
 */
export async function submitForm(key, email, data) {
  const response = await api.post(`/forms/submit/${key}`, { email, data });
  return response.data;
}

/**
 * Submit general support / query message
 * @param {object} payload Message attributes (name, email, subject, message, type)
 * @returns {Promise<object>} Response details
 */
export async function submitContactMessage(payload) {
  const response = await api.post('/forms/contact', payload);
  return response.data;
}

/**
 * Fetch all form submissions (restricted to Admins)
 * @returns {Promise<object>} Submissions list array
 */
export async function getSubmissions() {
  const response = await api.get('/forms/admin/submissions');
  return response.data;
}

/**
 * Toggle status of a form submission (restricted to Admins)
 * @param {string} id Submission ID
 * @param {string} status Queue status flag (PENDING, REVIEWED, APPROVED, REJECTED)
 * @returns {Promise<object>} Updated record details
 */
export async function updateSubmissionStatus(id, status) {
  const response = await api.patch(`/forms/admin/submissions/${id}/status`, { status });
  return response.data;
}

/**
 * Fetch all logged contact support messages (restricted to Admins)
 * @returns {Promise<object>} Messages list array
 */
export async function getContactMessages() {
  const response = await api.get('/forms/admin/messages');
  return response.data;
}

/**
 * Toggle status of contact support message (restricted to Admins)
 * @param {string} id Message ID
 * @param {string} status Message status flag (UNREAD, READ, REPLIED)
 * @returns {Promise<object>} Updated record details
 */
export async function updateContactMessageStatus(id, status) {
  const response = await api.patch(`/forms/admin/messages/${id}/status`, { status });
  return response.data;
}
