import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, Search, Moon, Sun } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState, useEffect } from 'react';

export default function Navbar({ onSearchChange }) {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const [search, setSearch] = useState('');
	const [isDark, setIsDark] = useState(false);

	// Sync with system preference + localStorage
	useEffect(() => {
		const saved = localStorage.getItem('theme');
		const prefersDark = window.matchMedia(
			'(prefers-color-scheme: dark)'
		).matches;
		const initial = saved === 'dark' || (!saved && prefersDark);
		setIsDark(initial);
		document.documentElement.classList.toggle('dark', initial);
	}, []);

	const toggleTheme = () => {
		const newDark = !isDark;
		setIsDark(newDark);
		document.documentElement.classList.toggle('dark', newDark);
		localStorage.setItem('theme', newDark ? 'dark' : 'light');
	};

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
		<nav className='bg-background shadow-sm border-b border-border sticky top-0 z-40'>
			<div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
				<div className='flex flex-wrap justify-between items-center py-3 gap-4'>
					<h1
						className='text-2xl font-bold text-primary cursor-pointer select-none tracking-tight'
						onClick={() => window.location.reload()}
					>
						TodoMate
					</h1>

					{/* Search Bar */}
					<div
						className={`
						flex items-center flex-1 max-w-md rounded-xl px-3 py-2
						bg-(--color-card) border border-(--color-border)
						transition-colors duration-200
						hover:bg-[color-mix(in srgb,var(--color-primary) 8%,var(--color-card))]
						focus-within:ring-2 focus-within:ring-(--color-primary)
					`}
					>
						<Search
							size={18}
							className='text-[color-mix(in srgb,var(--color-foreground),#00000040)] mr-2 transition-colors duration-200'
						/>
						<input
							type='text'
							placeholder='Search todos...'
							value={search}
							onChange={handleSearch}
							className='flex-1 text-sm bg-transparent outline-none text-foreground placeholder-muted-foreground'
						/>
					</div>

					{/* Theme Toggle + User + Logout */}
					<div className='flex items-center gap-3'>
						{/* Dark Mode Toggle */}
						<button
							onClick={toggleTheme}
							className='p-2 rounded-lg bg-card hover:bg-muted transition-all cursor-pointer'
							aria-label='Toggle dark mode'
						>
							{isDark ? <Sun size={18} /> : <Moon size={18} />}
						</button>

						<span className='text-foreground font-medium hidden sm:inline'>
							{user}
						</span>
						<button
							onClick={handleLogout}
							className='flex items-center gap-1.5 bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 transition-all shadow-sm hover:shadow cursor-pointer'
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
