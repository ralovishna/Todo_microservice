import axios from 'axios';
import toast from 'react-hot-toast';
import { getToken } from '../utils/storage';
import { logoutHelper } from '../utils/logoutHelper';

const axiosClient = axios.create({
	baseURL: 'http://localhost:8080', // ✅ use your correct backend port + prefix
	withCredentials: false,
});

// ✅ Attach token
axiosClient.interceptors.request.use((config) => {
	const token = getToken();
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});

// ✅ Global error handling
axiosClient.interceptors.response.use(
	(res) => res,
	(error) => {
		const status = error.response?.status;
		const url = error.config?.url || '';

		if (status === 401 && !url.includes('/auth/login')) {
			toast.error('Session expired. Please log in again.');
			logoutHelper();
		} else if (status >= 500) {
			toast.error('Server error. Please try again later.');
		}
		return Promise.reject(error);
	}
);

export default axiosClient;
