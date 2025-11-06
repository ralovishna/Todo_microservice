import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import TodoList from './pages/todos/TodoList';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';

function ProtectedRoute({ children }) {
	const { auth } = useAuth();
	return auth.token ? children : <Navigate to='/login' />;
}

function PublicRoute({ children }) {
	const { auth } = useAuth();
	return auth.token ? <Navigate to='/todos' /> : children;
}

export default function App() {
	const { auth } = useAuth();

	return (
		<Routes>
			{/* Public routes */}
			<Route
				path='/login'
				element={
					<PublicRoute>
						<Login />
					</PublicRoute>
				}
			/>
			<Route
				path='/register'
				element={
					<PublicRoute>
						<Register />
					</PublicRoute>
				}
			/>

			{/* Protected routes */}
			<Route
				path='/todos'
				element={
					<ProtectedRoute>
						<TodoList />
					</ProtectedRoute>
				}
			/>

			{/* Catch-all route */}
			<Route
				path='*'
				element={<Navigate to={auth.token ? '/todos' : '/login'} />}
			/>
		</Routes>
	);
}
