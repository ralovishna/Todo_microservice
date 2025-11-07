import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

/**
 * Custom hook to centralize and handle various API errors gracefully.
 *
 * @returns {Function} handleApiError - A unified error handler function.
 */
export function useApiErrorHandler() {
	const { logout } = useAuth();

	/**
	 * Handles an Axios error object, displaying toasts and optional field errors.
	 *
	 * @param {object} error - Axios error object
	 * @param {Function} setErrors - React state setter for field errors (optional)
	 * @param {string} fallbackMsg - Default message if backend provides none
	 */
	const handleApiError = (
		error,
		setErrors,
		fallbackMsg = 'Something went wrong'
	) => {
		// 🌐 No response — likely network, CORS, or server is down
		if (!error?.response) {
			toast.error('Network error. Could not connect to the server.');
			// Always reject the promise so calling functions can still use .catch if needed
			return Promise.reject(error);
		}

		// ✅ Destructure relevant data from the response
		const { status, data } = error.response;
		const msg = data.message || data.error || fallbackMsg;
		const url = error.config?.url || '';

		// 🔐 Unauthorized (401: invalid creds or expired token)
		if (status === 401) {
			if (!url.includes('/auth/login')) {
				toast.error('Session expired. Please log in again.');
				logout(true); // Assuming logout handles redirection
			} else {
				// Specific message for login failure
				toast.error('Invalid username or password.');
			}
			return Promise.reject(error);
		}

		// 🧩 Validation errors (400: e.g., 'Validation failed' backend response)
		if (status === 400 && data?.error === 'Validation failed' && data.details) {
			if (setErrors) setErrors(data.details);
			toast.error('Please correct the highlighted fields.');
			return Promise.reject(error);
		}

		// 💡 Minor Improvement: Handle specific backend messages more generically if possible.
		if (status === 400 && msg.includes('size must be between')) {
			toast.error('Title ' + msg);
			return Promise.reject(error);
		}

		// ⚙️ Business logic / generic errors handling via switch
		switch (status) {
			case 403:
				toast.error('Forbidden — you don’t have permission.');
				break;
			case 404:
				// Specific messages based on context
				if (url.includes('/auth/login') || url.includes('/auth/register')) {
					toast.error('User resource not found.');
				} else {
					toast.error('The requested resource was not found.');
				}
				break;
			case 409:
				toast.error(
					'A conflicting entry already exists. Please choose a different name.'
				);
				break;
			case 500:
				toast.error('Server error — please try again later.');
				break;
			default:
				// Fallback for any other status code with the provided message
				toast.error(msg);
		}

		// Important: Always reject the promise so calling functions can handle specific cases if they need to
		return Promise.reject(error);
	};

	return handleApiError;
}
