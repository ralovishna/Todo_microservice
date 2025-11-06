import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
// import { useLogout } from './useLogout';

/**
 * Unified API error handler for backend responses.
 * Handles validation, business logic, and expired tokens gracefully.
 *
 * @param {object} error - Axios error object
 * @param {Function} setErrors - React state setter for field errors (optional)
 */
export function useApiErrorHandler() {
	const { logout } = useAuth();

	const handleApiError = (
		error,
		setErrors,
		fallbackMsg = 'Something went wrong'
	) => {
		if (!error?.response) {
			toast.error('Network error — please check your connection');
			return;
		}

		const status = error.response.status;
		const data = error.response.data || {};
		const msg = data.message || data.error || fallbackMsg;
		const url = error.config?.url || '';
		console.log('comming ' + status + '  ' + data + ' ' + msg + ' ' + url);

		// 🔐 Unauthorized (invalid creds or expired token)
		if (status === 401) {
			if (url.includes('/auth/login')) {
				toast.error('Invalid username or password.');
				return;
			}

			// 💡 Session expired for other routes
			toast.error('Session expired. Please log in again.');
			logout(true);
			return;
		}

		// 🧩 Validation errors (400)
		if (status === 400 && data?.error === 'Validation failed' && data.details) {
			if (setErrors) setErrors(data.details);
			toast.error('Please correct the highlighted fields.');
			return;
		} else if (status === 400 && msg === 'size must be between 3 and 100') {
			toast.error('Title size must be between 3 and 100');
			return;
		}

		// ⚙️ Business logic / generic errors
		switch (status) {
			case 403:
				toast.error('Forbidden — you don’t have permission');
				break;
			case 404:
				if (error.config?.url?.includes('/auth/login')) {
					toast.error('Invalid username or password.');
				} else if (error.config?.url?.includes('/auth/register')) {
					toast.error('Username not found or unavailable.');
				} else {
					toast.error('The requested resource was not found.');
				}
				break;
			case 409:
				toast.error(
					'A name with this value already exists. Please choose a different name'
				);
				break;
			case 500:
				toast.error('Server error — please try again later');
				break;
			default:
				toast.error(msg);
		}
	};

	return handleApiError;
}
