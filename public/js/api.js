/**
 * API Service for Student CRUD operations.
 * Dynamically resolves the API base URL for both development dev servers,
 * external previews, and production deployments.
 */

function resolveApiBase() {
  if (typeof window === 'undefined') return '';

  // 1. Explicit global variable override
  if (window.__API_BASE__ && typeof window.__API_BASE__ === 'string') {
    return window.__API_BASE__.trim().replace(/\/+$/, '');
  }

  // 2. HTML meta tag override (convenient for production/CDN injections)
  const metaTag = document.querySelector('meta[name="api-base"]');
  const metaContent = metaTag?.getAttribute('content')?.trim();
  if (metaContent) {
    return metaContent.replace(/\/+$/, '');
  }

  // 3. Local development fallback when running via separate static servers
  // (e.g. VS Code Live Server on port 5500, Vite on 5173, or file protocol)
  const { protocol, hostname, port } = window.location;
  if (protocol === 'file:') {
    return 'http://localhost:3000';
  }

  const isLocalHost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
  if (isLocalHost && port && port !== '3000') {
    return `http://${hostname}:3000`;
  }

  // 4. Same-origin default for Express-hosted dev, Render production, Docker, and reverse proxies
  return '';
}

const API_BASE = resolveApiBase();
const STUDENTS_URL = `${API_BASE}/students`;

async function handleResponse(response) {
  // Support 204 No Content gracefully
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  }

  if (!response.ok) {
    const errorMsg = (data && data.message) 
      ? data.message 
      : `Request failed with status ${response.status} (${response.statusText})`;
    const error = new Error(errorMsg);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const StudentApi = {
  /**
   * Fetch all student records
   * @returns {Promise<Array>} List of students
   */
  async getAll() {
    const response = await fetch(STUDENTS_URL, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return handleResponse(response);
  },

  /**
   * Fetch a single student by ID
   * @param {number|string} id
   * @returns {Promise<Object>} Student record
   */
  async getById(id) {
    const response = await fetch(`${STUDENTS_URL}/${encodeURIComponent(id)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });
    return handleResponse(response);
  },

  /**
   * Create a new student record
   * @param {Object} studentData
   * @returns {Promise<Object>} Created student
   */
  async create(studentData) {
    const response = await fetch(STUDENTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  /**
   * Update an existing student record
   * @param {number|string} id
   * @param {Object} studentData
   * @returns {Promise<Object>} Updated student
   */
  async update(id, studentData) {
    const response = await fetch(`${STUDENTS_URL}/${encodeURIComponent(id)}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(studentData),
    });
    return handleResponse(response);
  },

  /**
   * Delete a student by ID
   * @param {number|string} id
   * @returns {Promise<Object>} Deletion result
   */
  async delete(id) {
    const response = await fetch(`${STUDENTS_URL}/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      headers: { 'Accept': 'application/json' },
    });
    return handleResponse(response);
  },
};

