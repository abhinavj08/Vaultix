import axios from 'axios';

const baseURL = import.meta.env.MODE === 'production' ? (import.meta.env.VITE_API_URL || '') : '';

const api = axios.create({
  baseURL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const registerUser = async (name, email, password) => {
  const response = await api.post('/api/auth/register', { name, email, password });
  return response.data;
};

export const loginUser = async (email, password) => {
  const response = await api.post('/api/auth/login', { email, password });
  return response.data;
};

export const getMe = async () => {
  const response = await api.get('/api/auth/me');
  return response.data;
};

export const getTransactions = async (month, year) => {
  const response = await api.get(`/api/transactions?month=${month}&year=${year}`);
  return response.data;
};

export const addTransaction = async (data) => {
  const response = await api.post('/api/transactions', data);
  return response.data;
};

export const uploadCSV = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/api/transactions/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
};

export const deleteTransaction = async (id) => {
  const response = await api.delete(`/api/transactions/${id}`);
  return response.data;
};

export const getDashboard = async (month, year) => {
  const response = await api.get(`/api/dashboard/summary?month=${month}&year=${year}`);
  return response.data;
};

export const getBudgets = async (month, year) => {
  const response = await api.get(`/api/budgets?month=${month}&year=${year}`);
  return response.data;
};

export const updateBudgets = async (budgets, month, year) => {
  const response = await api.put(`/api/budgets`, { budgets, month, year });
  return response.data;
};

export default api;
