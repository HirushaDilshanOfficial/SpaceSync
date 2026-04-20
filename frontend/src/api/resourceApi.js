import axios from 'axios';

const BASE_URL = 'http://localhost:8081/api/v1/resources';

export const resourceApi = {
  getAll: (filters = {}) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(([_, v]) => v !== '' && v !== null && v !== undefined)
    );
    return axios.get(BASE_URL, { params });
  },
  getById:      (id)       => axios.get(`${BASE_URL}/${id}`),
  create:       (data)     => axios.post(BASE_URL, data),
  update:       (id, data) => axios.put(`${BASE_URL}/${id}`, data),
  updateStatus: (id, status) => axios.patch(`${BASE_URL}/${id}/status`, { status }),
  remove:       (id)       => axios.delete(`${BASE_URL}/${id}`),
};