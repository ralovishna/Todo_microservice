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

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
		setErrors({ ...errors, [e.target.name]: '' });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setErrors({});
		setLoading(true);

		try {
			const res = await axiosClient.post(endpoint, form);

			if (role === 'login') {
				// AuthProvider handles navigation/toasts internally for login
				login(res.data.token);
			} else {
				toast.success('Success!'); // Generic success toast for register
			}

			// Call the specific success function passed by Login or Register component
			if (onSuccess) onSuccess(res.data);
		} catch (err) {
			handleApiError(
				err,
				setErrors,
				`${role.charAt(0).toUpperCase() + role.slice(1)} failed.`
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
				<h1 className='text-2xl font-bold text-center text-gray-800'>
					{role.charAt(0).toUpperCase() + role.slice(1)}
				</h1>

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
							errors.username ? 'border-red-500' : `focus:ring-${mainColor}-400`
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
							errors.password ? 'border-red-500' : `focus:ring-${mainColor}-400`
						}`}
					/>
					<button
						type='button'
						onClick={() => setShowPassword((prev) => !prev)}
						className={`absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700 ${
							role == 'register' && errors.password != '' ? 'bottom-4' : ''
						}`}
						aria-label={showPassword ? 'Hide password' : 'Show password'}
					>
						{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
					</button>
					{errors.password && (
						<p className='text-red-500 text-[11px] mt-1'>{errors.password}</p>
					)}
				</div>

				{/* Submit Button */}
				<button
					type='submit'
					disabled={loading}
					className={`w-full ${
						loading
							? 'bg-gray-400 cursor-not-allowed'
							: `bg-${mainColor}-600 hover:bg-${mainColor}-700`
					} text-white py-2 rounded-lg transition duration-150 ease-in-out`}
				>
					{loading
						? `${role.charAt(0).toUpperCase() + role.slice(1)}ing...`
						: role.charAt(0).toUpperCase() + role.slice(1)}
				</button>

				{/* Link to other form */}
				<p className='text-sm text-center'>
					{role === 'login'
						? 'Don’t have an account?'
						: 'Already have an account?'}{' '}
					<Link
						to={linkTo}
						className={`text-${mainColor}-600 font-semibold hover:underline`}
					>
						{linkText}
					</Link>
				</p>
			</form>
		</div>
	);
};

export default AuthForm;
