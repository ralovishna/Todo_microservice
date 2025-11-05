import axios from 'axios';
import { getToken } from '../utils/storage';

const axiosClient = axios.create({
    //gateway
	baseURL: 'http://localhost:8080',
    //content type 
	headers: { 'Content-Type': 'application/json' },
});

// 🔐 Interceptor to attach JWT automatically
axiosClient.interceptors.request.use((config) => {
	const token = getToken();
	if (token) {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export default axiosClient;
