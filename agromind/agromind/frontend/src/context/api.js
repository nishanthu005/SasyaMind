import axios from 'axios';

const API = axios.create({ baseURL: '/api' });

export const getDashboard = () => API.get('/dashboard');
export const detectDisease = (crop, imageBase64) => API.post('/detect-disease', { crop, image: imageBase64 });
export const predictYield = (data) => API.post('/predict-yield', data);
export const getIrrigation = (data) => API.post('/irrigation', data);
export const getFertilizer = (data) => API.post('/fertilizer', data);
