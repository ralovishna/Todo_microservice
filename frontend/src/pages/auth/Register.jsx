import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axiosClient from '../../api/axiosClient';

export default function Register() {
	const [form, setForm] = useState({ username: '', password: '' });
	const navigate = useNavigate();

	const handleChange = (e) =>
		setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		try {
			await axiosClient.post('/auth/register', form);
			toast.success('Account created successfully!');
			navigate('/login');
		} catch (err) {
			toast.error(err.response?.data?.message || 'Registration failed');
		}
	};

	return (
		<div className='flex justify-center items-center min-h-screen bg-gray-100'>
			<form
				onSubmit={handleSubmit}
				className='bg-white shadow-lg rounded-2xl p-8 w-96 space-y-5'
			>
				<h1 className='text-2xl font-bold text-center'>Register</h1>

				<input
					type='text'
					name='username'
					placeholder='Username'
					value={form.username}
					onChange={handleChange}
					required
					className='w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400'
				/>

				<input
					type='password'
					name='password'
					placeholder='Password'
					value={form.password}
					onChange={handleChange}
					required
					className='w-full border rounded-lg p-2 focus:ring-2 focus:ring-green-400'
				/>

				<button
					type='submit'
					className='w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg transition'
				>
					Register
				</button>

				<p className='text-sm text-center'>
					Already have an account?{' '}
					<Link to='/login' className='text-green-600 font-semibold'>
						Login
					</Link>
				</p>
			</form>
		</div>
	);
}
