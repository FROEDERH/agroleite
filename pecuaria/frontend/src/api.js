import axios from 'axios';

// Local: '/api' passa pelo proxy do Vite até o backend em localhost:5000.
// Hospedado (Cloudflare Pages): VITE_API_URL aponta para a API no Render,
// ex: https://agroleite-api.onrender.com
const api = axios.create({
  baseURL: `${(import.meta.env.VITE_API_URL || '').replace(/\/$/, '')}/api`
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const mensagem = error.response?.data?.erro || '';
      if (mensagem.includes('Token') || mensagem.includes('Sessão')) {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
