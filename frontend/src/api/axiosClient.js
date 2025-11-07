import axios from 'axios';
import { getToken } from '../utils/storage';

const axiosClient = axios.create({
	baseURL: 'http://localhost:8080',
	withCredentials: false,
});

// Attach token interceptor
axiosClient.interceptors.request.use((config) => {
	const token = getToken();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

export default axiosClient;
