import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token from localStorage on all requests
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

// Response interceptor to format errors meaningfully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export const authService = {
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

export const itemService = {
  getItems: async (params = {}) => {
    const response = await api.get('/items', { params });
    return response.data;
  },
  getItemById: async (id) => {
    const response = await api.get(`/items/${id}`);
    return response.data;
  },
  createItem: async (itemData) => {
    const response = await api.post('/items', itemData);
    return response.data;
  },
  updateItem: async (id, itemData) => {
    const response = await api.put(`/items/${id}`, itemData);
    return response.data;
  },
  deleteItem: async (id) => {
    const response = await api.delete(`/items/${id}`);
    return response.data;
  },
  getMyReportedItems: async () => {
    const response = await api.get('/items/mine');
    return response.data;
  },
  uploadImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/items/upload-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },
};

export const matchingService = {
  getMatches: async (itemId) => {
    const response = await api.get(`/items/${itemId}/matches`);
    return response.data;
  },
};

export const claimService = {
  createClaim: async (claimData) => {
    const response = await api.post('/claims', claimData);
    return response.data;
  },
  approveClaim: async (claimId) => {
    const response = await api.put(`/claims/${claimId}/approve`);
    return response.data;
  },
  rejectClaim: async (claimId) => {
    const response = await api.put(`/claims/${claimId}/reject`);
    return response.data;
  },
  getMyClaims: async () => {
    const response = await api.get('/claims/mine');
    return response.data;
  },
  getClaimsForItem: async (itemId) => {
    const response = await api.get(`/claims/item/${itemId}`);
    return response.data;
  },
};

export default api;
