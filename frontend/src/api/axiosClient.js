// src/api/axiosClient.js
import axios from 'axios';
import toast from 'react-hot-toast';
import { getToken } from '../utils/storage';
import { useLogout } from '../utils/useLogout'; // assuming this triggers context logout etc.

const axiosClient = axios.create({
	baseURL: 'http://localhost:8080', // gateway or backend base
});

// ✅ Attach token to every request
axiosClient.interceptors.request.use((config) => {
	const token = getToken();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

// ✅ Global error handling
axiosClient.interceptors.response.use(
	(response) => response,
	(error) => {
		const status = error.response?.status;
		const url = error.config?.url || '';

		// 🧩 Ignore 401s from /auth/login — handled by login page itself
		if (status === 401 && !url.includes('/auth/login')) {
			toast.error('Session expired. Please log in again.');
			useLogout(); // ✅ global session handling only for non-login routes
		} else if (status >= 500) {
			toast.error('Server error. Please try again later.');
		}

		// ⚠️ Let component-level code handle the error too
		return Promise.reject(error);
	}
);

export default axiosClient;
