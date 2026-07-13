import api from './api';

/**
 * Fetch all articles (optionally filtered by categories, tag, search keyword)
 * @param {object} params Query filters
 * @returns {Promise<object>} Articles array
 */
export async function getArticles(params) {
  const response = await api.get('/cms/articles', { params });
  return response.data;
}

/**
 * Fetch specific article details by slug
 * @param {string} slug Article slug
 * @returns {Promise<object>} Article details
 */
export async function getArticleBySlug(slug) {
  const response = await api.get(`/cms/articles/${slug}`);
  return response.data;
}

/**
 * Create a new article (Admin/Editor restricted)
 * @param {object} data Article fields
 * @returns {Promise<object>} Saved article
 */
export async function createArticle(data) {
  const response = await api.post('/cms/articles', data);
  return response.data;
}

/**
 * Update an existing article content (Admin/Editor restricted)
 * @param {string} id Article ID
 * @param {object} data Updated values
 * @returns {Promise<object>} Saved record
 */
export async function updateArticle(id, data) {
  const response = await api.put(`/cms/articles/${id}`, data);
  return response.data;
}

/**
 * Delete a news article (Admin/Editor restricted)
 * @param {string} id Article ID
 * @returns {Promise<object>} Result outcome
 */
export async function deleteArticle(id) {
  const response = await api.delete(`/cms/articles/${id}`);
  return response.data;
}

/**
 * Fetch a static page body content
 * @param {string} slug Page block identifier
 * @returns {Promise<object>} Page text body
 */
export async function getPageBySlug(slug) {
  const response = await api.get(`/cms/pages/${slug}`);
  return response.data;
}

/**
 * Update page block content (Admin/Editor restricted)
 * @param {string} slug Page block identifier
 * @param {object} data Updated details
 * @returns {Promise<object>} Saved page block
 */
export async function updatePageBlock(slug, data) {
  const response = await api.put(`/cms/pages/${slug}`, data);
  return response.data;
}

/**
 * Upload a media asset (Admin/Editor restricted)
 * @param {File} file Binary file
 * @returns {Promise<object>} Saved asset details
 */
export async function uploadMedia(file) {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/cms/media/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

/**
 * Retrieve uploaded media asset logs (Admin/Editor restricted)
 * @returns {Promise<object>} Media items array
 */
export async function getMediaAssets() {
  const response = await api.get('/cms/media');
  return response.data;
}

/**
 * Delete a media asset from library (Admin/Editor restricted)
 * @param {string} id Asset ID
 * @returns {Promise<object>} Result status
 */
export async function deleteMediaAsset(id) {
  const response = await api.delete(`/cms/media/${id}`);
  return response.data;
}
