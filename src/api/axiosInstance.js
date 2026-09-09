import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 20000,
  headers: { Accept: 'application/json, text/plain, */*' },
});

export default axiosInstance;
