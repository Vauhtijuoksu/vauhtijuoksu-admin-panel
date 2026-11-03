import axios from 'axios';
import { ref } from 'vue';

// Set VITE_API_URL in .env.development.local to use another API in development, e.g. a local one
const API_URL = import.meta.env.VITE_API_URL ?? 'https://api.vauhtijuoksu.fi';

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
  alert("Tallennus epäonnistui, tätä muutosta ei tehty");
};

// True while reading from the API fails. Shown as a banner, since an alert on every poll would block the page
export const apiError = ref(false);

/**
 * Create an authenticated axios instance
 */
export const api = {
  /**
   * GET request
   */
  get: (endpoint) => {
    return axios.get(`${API_URL}${endpoint}`)
      .then(response => {
        apiError.value = false;
        return response;
      })
      .catch(err => {
        console.log(err);
        apiError.value = true;
      });
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

