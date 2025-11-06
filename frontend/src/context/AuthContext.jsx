import { createContext, useContext, useState, useEffect } from 'react';
import { setToken, removeToken, getToken } from '../utils/storage';
import { jwtDecode } from 'jwt-decode';
import { useLogout } from '../utils/useLogout';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

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
				useLogout(true); // 🔹 soft logout — clean but no hard reload
			}
		}
		return { token, user };
	});

	// ✅ Validate token once at startup (soft logout on failure)
	useEffect(() => {
		const validateToken = async () => {
			if (!auth.token) return;
			try {
				await axiosClient.get('/auth/validate');
			} catch (err) {
				console.warn('Token invalid or expired. Logging out softly.');
				toast.error('Your session expired. Please log in again.');
				useLogout(true); // 🔹 clears token + updates state, no reload
				setAuth({ token: null, user: null });
			}
		};
		validateToken();
	}, []);

	// ✅ Sync token to localStorage whenever it changes
	useEffect(() => {
		if (auth.token) setToken(auth.token);
		else removeToken();
	}, [auth.token]);

	// ✅ Login handler
	const login = (token) => {
		try {
			const decoded = jwtDecode(token);
			const user = decoded.sub || decoded.username || null;
			setAuth({ token, user });
			setToken(token);
			navigate('/todos');
		} catch (err) {
			console.error('Failed to decode JWT:', err);
			toast.error('Invalid token received. Please try again.');
		}
	};

	// ✅ Logout handler
	const logout = (soft = false) => {
		setAuth({ token: null, user: null });
		toast.success('Logged out successfully');
		useLogout(soft);
	};

	return (
		<AuthContext.Provider value={{ auth, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
