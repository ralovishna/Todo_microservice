import { useState } from 'react';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useApiErrorHandler } from '../../utils/handleApiError';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const AuthForm = ({
	role,
	endpoint,
	linkTo,
	linkText,
	mainColor,
	onSuccess,
}) => {
	const [form, setForm] = useState({ username: '', password: '' });
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const { login } = useAuth();
	const handleApiError = useApiErrorHandler();

	const isLogin = role === 'login';

	const handleChange = (e) => {
		const { name, value } = e.target;
		setForm((prev) => ({ ...prev, [name]: value }));
		setErrors((prev) => ({ ...prev, [name]: '' }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrors({});
		setLoading(true);

		try {
			const { data } = await axiosClient.post(endpoint, form);

			if (isLogin) {
				login(data.token); // AuthContext handles navigation + toast
			} else {
				toast.success('Account created successfully!');
			}

			onSuccess?.(data);
		} catch (err) {
			handleApiError(
				err,
				setErrors,
				`${isLogin ? 'Login' : 'Registration'} failed.`
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex min-h-screen items-center justify-center bg-linear-to-br from-gray-50 to-gray-100 p-4'>
			<form
				onSubmit={handleSubmit}
				className='w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl'
			>
				<h1 className='text-center text-3xl font-bold text-gray-800'>
					{isLogin ? 'Welcome Back' : 'Create Account'}
				</h1>

				{/* Username */}
				<div>
					<input
						type='text'
						name='username'
						placeholder='Enter username'
						value={form.username}
						onChange={handleChange}
						required
						disabled={loading}
						className={`w-full rounded-lg text-gray-800 border px-4 py-3 text-sm transition-all focus:outline-none focus:ring-2 ${
							errors.username
								? 'border-red-500 focus:ring-red-400'
								: `border-gray-300 focus:ring-${mainColor}-500`
						}`}
					/>
					{errors.username && (
						<p className='mt-1 text-xs text-red-500'>{errors.username}</p>
					)}
				</div>

				{/* Password */}
				<div className='relative'>
					<input
						type={showPassword ? 'text' : 'password'}
						name='password'
						placeholder='Enter password'
						value={form.password}
						onChange={handleChange}
						required
						disabled={loading}
						className={`w-full rounded-lg border px-4 py-3 pr-12 text-sm transition-all focus:outline-none focus:ring-2 ${
							errors.password
								? 'border-red-500 focus:ring-red-400'
								: `border-gray-300 focus:ring-${mainColor}-500`
						}`}
					/>

					{/* Eye icon button */}
					<button
						type='button'
						onClick={() => setShowPassword(!showPassword)}
						className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors bottom-5'
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>

					{/* Error message: reserve vertical space to prevent layout shift */}
					<p className='mt-1 text-xs text-red-500 min-h-5'>
						{errors.password || ''}
					</p>
				</div>

				{/* Submit */}
				<button
					type='submit'
					disabled={loading}
					className={`w-full rounded-lg py-3 font-medium transition-all active:scale-95 ${
						loading
							? 'cursor-not-allowed bg-gray-400 text-white'
							: isLogin
							? 'bg-blue-500 hover:bg-blue-600 text-white'
							: 'bg-green-500 hover:bg-green-600 border border-gray-300'
					}`}
				>
					{loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Sign Up'}
				</button>

				{/* Link */}
				<p className='text-center text-sm text-gray-600'>
					{isLogin ? "Don't have an account? " : 'Already have an account? '}
					<Link
						to={linkTo}
						className={`font-semibold text-${mainColor}-600 hover:underline`}
					>
						{linkText}
					</Link>
				</p>
			</form>
		</div>
	);
};

export default AuthForm;
