import { createContext, useContext, useState, useEffect } from 'react';
import { setToken, removeToken, getToken } from '../utils/storage';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API } from '../api/endPoints';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const navigate = useNavigate();

	const [auth, setAuth] = useState(() => {
		const token = getToken();
		let user = null;

		if (token) {
			try {
				const decoded = jwtDecode(token);
				user = decoded.sub || decoded.username || null;
			} catch (e) {
				console.error('Invalid JWT found:', e);
				removeToken(); // just clear token — don't call useLogout here
			}
		}
		return { token, user };
	});

	// ✅ Validate token once at startup (soft logout on failure)
	useEffect(() => {
		const validateToken = async () => {
			if (!auth.token) return;
			try {
				await axiosClient.get(API.AUTH.VALIDATE);
			} catch (err) {
				console.warn('Token invalid or expired. Logging out softly.');
				toast.error('Your session expired. Please log in again.');
				handleLogout(true);
			}
		};
		validateToken();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ✅ Sync token to localStorage whenever it changes
	useEffect(() => {
		if (auth.token) setToken(auth.token);
		else removeToken();
	}, [auth.token]);

	// ✅ Login handler
	const handleLogin = (token) => {
		try {
			const decoded = jwtDecode(token);
			const user = decoded.sub || decoded.username || null;
			setAuth({ token, user });
			setToken(token);
			navigate(API.TODOS);
		} catch (err) {
			console.error('Failed to decode JWT:', err);
			toast.error('Invalid token received. Please try again.');
		}
	};

	// ✅ Logout handler (centralized)
	const handleLogout = (soft = false) => {
		setAuth({ token: null, user: null });
		removeToken();

		if (!soft) {
			toast.success('Logged out successfully');
			navigate('/login', { replace: true });
		}
	};

	return (
		<AuthContext.Provider
			value={{ auth, login: handleLogin, logout: handleLogout, setAuth }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
