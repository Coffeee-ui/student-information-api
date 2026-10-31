/**
 * API Service for Student CRUD operations.
 * Dynamically resolves the API base URL without hardcoded localhost.
 */

// Use window.__API_BASE__ if configured, otherwise fall back to relative path or origin
const API_BASE = (typeof window !== 'undefined' && window.__API_BASE__) 
  ? window.__API_BASE__.replace(/\/+$/, '') 
  : '';

const STUDENTS_URL = `${API_BASE}/students`;

async function handleResponse(response) {
  const contentType = response.headers.get('content-type');
  let data = null;
  if (contentType && contentType.includes('application/json')) {
    data = await response.json();
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

