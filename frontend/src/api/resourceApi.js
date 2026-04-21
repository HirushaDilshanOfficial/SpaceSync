import axios from 'axios';

const BASE_URL = 'http://localhost:8081/api/v1/resources';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const resourceApi = {
  getAll: (filters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    return axios.get(BASE_URL, { params });
  },
  getById:      (id)       => axios.get(`${BASE_URL}/${id}`),
  create:       (data)     => axios.post(BASE_URL, data, { headers: getAuthHeader() }),
  update:       (id, data) => axios.put(`${BASE_URL}/${id}`, data, { headers: getAuthHeader() }),
  updateStatus: (id, status) => axios.patch(`${BASE_URL}/${id}/status`, { status }, { headers: getAuthHeader() }),
  remove:       (id)       => axios.delete(`${BASE_URL}/${id}`, { headers: getAuthHeader() }),
};