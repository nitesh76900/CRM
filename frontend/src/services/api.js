// api.js
import axios from "axios";

const api = axios.create({
  baseURL: 'http://localhost:5000/api/v1', 
    // baseURL: 'https://codedev-crm-company.onrender.com/api/v1', 
  withCredentials: true, 
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access
    }
    return Promise.reject(error);
  }
);

export default api;
