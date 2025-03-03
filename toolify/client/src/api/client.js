import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '/api',
  timeout: 60000, // 60 seconds timeout for production (PDF operations can take time)
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Don't override Content-Type if it's multipart/form-data (for file uploads)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    // Add any authentication tokens if needed
    // const token = localStorage.getItem('auth_token');
    // if (token) {
    //   config.headers['Authorization'] = `Bearer ${token}`;
    // }
    
    return config;
  },
  (error) => {
    console.error('Request error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle specific error codes
    if (error.response) {
      const { status } = error.response;
      
      if (status === 401) {
        // Handle unauthorized access
        console.error('Unauthorized access. Please log in again.');
        // Redirect to login or clear credentials
      } else if (status === 403) {
        // Handle forbidden access
        console.error('Access forbidden.');
      } else if (status === 404) {
        // Handle not found
        console.error('Resource not found.');
      } else if (status === 500) {
        // Handle server errors
        console.error('Server error. Please try again later.');
      }
    } else if (error.request) {
      // Handle network errors
      console.error('Network error. Please check your connection.');
    } else {
      // Handle other errors
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient; 