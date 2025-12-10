// WordPress API Configuration
const API_URL = import.meta.env.VITE_WORDPRESS_API_URL || 'https://wordpress.ankaverse.com.tr/wp-json/wp/v2';

/**
 * Generic fetch function for WordPress API
 * @param {string} endpoint - The API endpoint (e.g., 'posts', 'pages')
 * @param {object} params - Query parameters
 * @returns {Promise<any>} - The JSON response
 */
export const fetchFromAPI = async (endpoint, params = {}) => {
  const url = new URL(`${API_URL}/${endpoint}`);
  
  // Add query parameters
  Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));

  try {
    const response = await fetch(url.toString());
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error('API Fetch Error:', error);
    throw error;
  }
};

/**
 * Fetch Projects
 * @returns {Promise<Array>}
 */
export const getProjects = async () => {
  // '_embed' parameter is used to include featured images and other related data
  return fetchFromAPI('project', { _embed: true, per_page: 100 });
};

/**
 * Fetch Single Project by ID
 * @param {number} id 
 * @returns {Promise<object>}
 */
export const getProjectById = async (id) => {
  return fetchFromAPI(`project/${id}`, { _embed: true });
};

/**
 * Fetch Services
 * @returns {Promise<Array>}
 */
export const getServices = async () => {
  return fetchFromAPI('service', { _embed: true, per_page: 100 });
};

/**
 * Fetch Blog Posts
 * @returns {Promise<Array>}
 */
export const getBlogPosts = async (page = 1, per_page = 9, params = {}) => {
  return fetchFromAPI('posts', { _embed: true, per_page, page, ...params });
};

/**
 * Fetch Single Blog Post by ID
 * @param {number} id 
 * @returns {Promise<object>}
 */
export const getBlogPostById = async (id) => {
  return fetchFromAPI(`posts/${id}`, { _embed: true });
};

/**
 * Fetch Page by Slug (for About, Contact etc.)
 * @param {string} slug 
 * @returns {Promise<object>}
 */
export const getPageBySlug = async (slug) => {
  const pages = await fetchFromAPI('pages', { slug, _embed: true });
  return pages.length > 0 ? pages[0] : null;
};

/**
 * Fetch Media by ID
 * @param {number} id
 * @returns {Promise<object>}
 */
export const getMediaById = async (id) => {
  return fetchFromAPI(`media/${id}`);
};

/**
 * Fetch Categories
 * @returns {Promise<Array>}
 */
export const getCategories = async () => {
  return fetchFromAPI('categories', { per_page: 100 });
};