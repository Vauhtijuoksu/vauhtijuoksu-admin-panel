import axios from 'axios';

const API_URL = 'https://api.dev.vauhtijuoksu.fi';

/**
 * Get authentication credentials from localStorage
 */
const getAuth = () => ({
  username: localStorage.getItem('username'),
  password: localStorage.getItem('password')
});

/**
 * Handle API errors consistently
 */
const handleError = (err) => {
  console.log(err);
  alert("Something went wrong, refresh page and see damages");
};

/**
 * Create an authenticated axios instance
 */
export const api = {
  /**
   * GET request
   */
  get: (endpoint) => {
    return axios.get(`${API_URL}${endpoint}`).catch(handleError);
  },

  /**
   * POST request with authentication
   */
  post: (endpoint, data) => {
    return axios.post(`${API_URL}${endpoint}`, data, {
      auth: getAuth()
    }).catch(handleError);
  },

  /**
   * PATCH request with authentication
   */
  patch: (endpoint, data) => {
    return axios.patch(`${API_URL}${endpoint}`, data, {
      auth: getAuth()
    }).catch(handleError);
  },

  /**
   * DELETE request with authentication
   */
  delete: (endpoint) => {
    return axios.delete(`${API_URL}${endpoint}`, {
      auth: getAuth()
    }).catch(handleError);
  }
};

export default api;

