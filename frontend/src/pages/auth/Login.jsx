import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';

export default function Login() {
	const [form, setForm] = useState({ username: '', password: '' });
	const navigate = useNavigate();
	const { login } = useAuth();

	const handleChange = (e) =>
		setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			const res = await axiosClient.post('/auth/login', form);
			login(res.data.token, form.username);
			toast.success('Logged in successfully!');
			navigate('/todos');
		} catch (err) {
			toast.error(err.response?.data?.message || 'Invalid credentials');
		}
	};

	return (
		<div className='flex justify-center items-center min-h-screen bg-gray-100'>
			<form
				onSubmit={handleSubmit}
				className='bg-white shadow-lg rounded-2xl p-8 w-96 space-y-5'
			>
				<h1 className='text-2xl font-bold text-center'>Login</h1>

				<input
					type='text'
					name='username'
					placeholder='Username'
					value={form.username}
					onChange={handleChange}
					required
					className='w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400'
				/>

				<input
					type='password'
					name='password'
					placeholder='Password'
					value={form.password}
					onChange={handleChange}
					required
					className='w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400'
				/>

				<button
					type='submit'
					className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition'
				>
					Login
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
