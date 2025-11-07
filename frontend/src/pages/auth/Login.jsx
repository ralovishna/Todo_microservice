import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useApiErrorHandler } from '../../utils/handleApiError';
import toast from 'react-hot-toast';
import { API } from '../../api/endPoints';
import { Eye, EyeOff } from 'lucide-react';

export default function Login() {
	const [form, setForm] = useState({ username: '', password: '' });
	const [errors, setErrors] = useState({});
	const [loading, setLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);

	const navigate = useNavigate();
	const { login } = useAuth();
	const handleApiError = useApiErrorHandler();

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		setErrors({ ...errors, [e.target.name]: '' });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrors({});
		setLoading(true);

		try {
			const res = await axiosClient.post(API.AUTH.LOGIN, form);
			login(res.data.token);
			toast.success('Logged in successfully!');
		} catch (err) {
			handleApiError(
				err,
				setErrors,
				'Login failed — please check your credentials.'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className='flex justify-center items-center min-h-screen bg-gray-100'>
			<form
				onSubmit={handleSubmit}
				className='bg-white shadow-lg rounded-2xl p-8 w-96 space-y-5'
			>
				<h1 className='text-2xl font-bold text-center text-gray-800'>Login</h1>

				{/* Username Field */}
				<div>
					<input
						type='text'
						name='username'
						placeholder='Username'
						value={form.username}
						onChange={handleChange}
						required
						className={`w-full border rounded-lg p-2 focus:ring-2 ${
							errors.username ? 'border-red-500' : 'focus:ring-blue-400'
						}`}
					/>
					{errors.username && (
						<p className='text-red-500 text-xs mt-1'>{errors.username}</p>
					)}
				</div>

				{/* Password Field */}
				<div className='relative'>
					<input
						type={showPassword ? 'text' : 'password'}
						name='password'
						placeholder='Password'
						value={form.password}
						onChange={handleChange}
						required
						className={`w-full border rounded-lg p-2 pr-10 focus:ring-2 ${
							errors.password ? 'border-red-500' : 'focus:ring-blue-400'
						}`}
					/>
					<button
						type='button'
						onClick={() => setShowPassword((prev) => !prev)}
						className='absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700'
					>
						{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
					{errors.password && (
						<p className='text-red-500 text-xs mt-1'>{errors.password}</p>
					)}
				</div>

				{/* Submit */}
				<button
					type='submit'
					disabled={loading}
					className={`w-full ${
						loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
					} text-white py-2 rounded-lg transition`}
				>
					{loading ? 'Logging in...' : 'Login'}
				</button>

				<p className='text-sm text-center'>
					Don’t have an account?{' '}
					<Link to='/register' className='text-blue-600 font-semibold'>
						Register
					</Link>
				</p>
			</form>
		</div>
	);
}
