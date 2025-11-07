// src/hooks/useLogout.js
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { removeToken } from '../utils/storage';
import toast from 'react-hot-toast';

export const useLogout = () => {
	const navigate = useNavigate();
	const { logout } = useAuth();

	const handleLogout = (soft = false) => {
		// console.log('🔒 useLogout triggered | soft =', soft);
		removeToken();
		logout(true); // call the context’s logout function
		if (!soft) {
			toast.success('You have been logged out.');
			navigate('/login', { replace: true });
		}
	};

	return handleLogout;
};
