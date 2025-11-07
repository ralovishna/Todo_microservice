import {
	createContext,
	useContext,
	useState,
	useEffect,
	useCallback,
} from 'react';
import { setToken, removeToken, getToken } from '../utils/storage';
import { jwtDecode } from 'jwt-decode';
import axiosClient from '../api/axiosClient';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { API } from '../api/endPoints';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const navigate = useNavigate();

	// Initialize auth state from local storage token during component mount
	const [auth, setAuth] = useState(() => {
		const token = getToken();
		let user = null;

		if (token) {
			try {
				const decoded = jwtDecode(token);
				user = decoded.sub || decoded.username || null;
			} catch (e) {
				console.error('Invalid JWT found during initialization:', e);
				removeToken(); // Clear invalid token
			}
		}
		return { token, user };
	});

	// Centralized Logout Handler
	const handleLogout = useCallback(
		(soft = false) => {
			setAuth({ token: null, user: null });
			removeToken(); // storage sync useEffect handles this too, but explicit call is safe

			if (!soft) {
				toast.success('Logged out successfully');
				navigate('/login', { replace: true });
			}
		},
		[navigate]
	);

	// Validate token on initial app load using an API call
	useEffect(() => {
		const validateToken = async () => {
			if (!auth.token) return;
			try {
				await axiosClient.get(API.AUTH.VALIDATE);
			} catch (err) {
				// 401/network error — session is invalid
				console.warn('Token invalid or expired. Performing soft logout.');
				toast.error('Your session expired. Please log in again.');
				handleLogout(true);
			}
		};
		validateToken();
	}, [auth.token, handleLogout]); // Dependency on auth.token and handleLogout

	// Sync token to localStorage whenever auth state changes
	useEffect(() => {
		if (auth.token) {
			setToken(auth.token);
		} else {
			removeToken();
		}
	}, [auth.token]);

	// Login Handler
	const handleLogin = useCallback(
		(token) => {
			try {
				const decoded = jwtDecode(token);
				const user = decoded.sub || decoded.username || null;
				setAuth({ token, user });
				navigate(API.TODOS);
			} catch (err) {
				console.error('Failed to decode JWT received from API:', err);
				toast.error('Invalid token received. Please try again.');
			}
		},
		[navigate]
	);

	return (
		<AuthContext.Provider
			value={{ auth, login: handleLogin, logout: handleLogout, setAuth }}
		>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
