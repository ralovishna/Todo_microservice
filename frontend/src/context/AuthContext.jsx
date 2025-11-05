// src/context/AuthContext.js
import { createContext, useContext, useState, useEffect } from 'react';
import { setToken, removeToken, getToken } from '../utils/storage';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const navigate = useNavigate();

	// Initialize auth from localStorage
	const [auth, setAuth] = useState(() => {
		const token = getToken();
		let user = null;

		if (token) {
			try {
				const decoded = jwtDecode(token);
				user = decoded.sub || decoded.username || null;
				console.log(user);
			} catch (e) {
				console.error('Invalid JWT in localStorage:', e);
			}
		}

		return { token, user };
	});

	// Sync token changes to localStorage
	useEffect(() => {
		if (auth.token) setToken(auth.token);
		else removeToken();
	}, [auth.token]);

	// Login: decode and set user
	const login = (token) => {
		try {
			const decoded = jwtDecode(token);
			const user = decoded.sub || decoded.username || null;
			setAuth({ token, user });
			setToken(token);
			navigate('/todos');
		} catch (error) {
			console.error('Failed to decode JWT:', error);
		}
	};

	// Logout: clear user + token
	const logout = () => {
		setAuth({ token: null, user: null });
		removeToken();
		navigate('/login');
	};

	return (
		<AuthContext.Provider value={{ auth, login, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
