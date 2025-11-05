import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Navbar() {
	const { user, logout } = useAuth();
	const navigate = useNavigate();

	const handleLogout = () => {
		logout();
		toast.success('Logged out');
		navigate('/login');
	};

	return (
		<nav className='bg-white shadow-md flex justify-between items-center px-6 py-3'>
			<h1 className='text-xl font-bold text-blue-600'>TodoMate</h1>
			<div className='flex items-center gap-4'>
				<span className='text-gray-700 font-medium'>{user}</span>
				<button
					onClick={handleLogout}
					className='flex items-center gap-1 bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-600 transition'
				>
					<LogOut size={18} /> Logout
				</button>
			</div>
		</nav>
	);
}
