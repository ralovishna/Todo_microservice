// src/hooks/useLogout.js
import { useNavigate } from 'react-router-dom';
import { removeToken } from '../utils/storage';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const useLogout = () => {
	const navigate = useNavigate();
	const { setAuth } = useAuth ? useAuth() : {};

	const logout = (soft = false) => {
		console.log('🔒 useLogout triggered | soft =', soft);
		removeToken();

		if (setAuth) setAuth({ token: null, user: null });

		if (!soft) {
			navigate('/login', { replace: true });
		}
	};

	return logout;
};
