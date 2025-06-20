import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api/',
  withCredentials: true, // ✅ Important if backend sets cookies
  headers: {
    'Content-Type': 'application/json',
    // Authorization: `Bearer ${token}`, // Uncomment and insert token if you're using JWT
  }
});

export default api;
