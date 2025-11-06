// components/layout/Navbar.jsx
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

export default function Navbar({ onSearchChange }) {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [search, setSearch] = useState('');

	const handleLogout = () => {
		logout();
		toast.success('Logged out successfully');
		navigate('/login');
	};

	const handleSearch = (e) => {
		const value = e.target.value;
		setSearch(value);
		onSearchChange?.(value);
	};

	return (
		<nav className='bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex flex-wrap justify-between items-center py-3 gap-4'>
					<h1
						className='text-2xl font-bold text-blue-600 cursor-pointer select-none tracking-tight'
						onClick={() => window.location.reload()}
					>
						TodoMate
					</h1>

					{/* Search Bar */}
					<div className='flex items-center bg-gray-100 rounded-xl px-3 py-2 flex-1 max-w-md transition-all hover:bg-gray-150 focus-within:ring-2 focus-within:ring-blue-400'>
						<Search size={18} className='text-gray-500 mr-2' />
						<input
							type='text'
							placeholder='Search todos...'
							value={search}
							onChange={handleSearch}
							className='bg-transparent outline-none flex-1 text-sm text-gray-700 placeholder-gray-400'
						/>
					</div>

					{/* User + Logout */}
					<div className='flex items-center gap-3'>
						<span className='text-gray-700 font-medium hidden sm:inline'>
							{user}
						</span>
						<button
							onClick={handleLogout}
							className='flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-all shadow-sm hover:shadow'
						>
							<LogOut size={16} />
							<span className='hidden sm:inline'>Logout</span>
						</button>
					</div>
				</div>
			</div>
		</nav>
	);
}
