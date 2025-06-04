import axios from 'axios';

// Determine the base URL for the API.
// In a development environment, this usually points to your local backend server.
// In a production environment, this would point to your deployed backend API.
const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? 'YOUR_PRODUCTION_API_URL' // Replace with your actual production API URL
  : 'http://localhost:5000/api'; // Default for local development

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});


export default api;