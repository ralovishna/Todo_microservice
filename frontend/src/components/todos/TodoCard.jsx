import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useApiErrorHandler } from '../utils/useApiErrorHandler';
import toast from 'react-hot-toast';
import { API } from '../../api/endPoints';

export default function TodoList() {
	const [todos, setTodos] = useState([]);
	const [filter, setFilter] = useState('pending'); // 👈 default status
	const [search, setSearch] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const handleApiError = useApiErrorHandler();

	// 🔄 Fetch Todos whenever filters change
	useEffect(() => {
		const fetchTodos = async () => {
			try {
				const params = {};
				if (filter && filter !== 'all') params.status = filter;
				if (search.trim()) params.search = search.trim();
				if (startDate) params.startDate = startDate;
				if (endDate) params.endDate = endDate;

				const res = await axiosClient.get(API.TODOS.BASE, { params });
				setTodos(res.data);
			} catch (err) {
				handleApiError(err, null, 'Failed to load todos');
			}
		};
		fetchTodos();
	}, [filter, search, startDate, endDate]);

	return (
		<div className='max-w-2xl mx-auto mt-10 p-6 bg-white shadow-lg rounded-xl'>
			<h2 className='text-2xl font-semibold mb-4 text-gray-800'>My Todos</h2>

			{/* 🧭 Filters */}
			<div className='flex flex-wrap gap-3 mb-5'>
				{['pending', 'all', 'completed'].map((f) => (
					<button
						key={f}
						onClick={() => setFilter(f)}
						className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
							filter === f
								? 'bg-blue-600 text-white'
								: 'bg-gray-100 hover:bg-gray-200 text-gray-800'
						}`}
					>
						{f.charAt(0).toUpperCase() + f.slice(1)}
					</button>
				))}
			</div>

			{/* 🔍 Search & Date Range */}
			<div className='flex flex-wrap gap-3 mb-6 items-center'>
				<input
					type='text'
					placeholder='Search by title...'
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					className='flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'
				/>
				<input
					type='date'
					value={startDate}
					onChange={(e) => setStartDate(e.target.value)}
					className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400'
				/>
				<input
					type='date'
					value={endDate}
					onChange={(e) => setEndDate(e.target.value)}
					className='border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-400'
				/>
				<button
					onClick={() => {
						setSearch('');
						setStartDate('');
						setEndDate('');
						toast('Filters cleared');
					}}
					className='px-4 py-2 bg-gray-200 rounded-lg text-sm hover:bg-gray-300 transition'
				>
					Clear
				</button>
			</div>

			{/* 📋 Todos List */}
			{todos.length === 0 ? (
				<p className='text-gray-500 text-center py-4'>No todos found.</p>
			) : (
				<ul className='space-y-2'>
					{todos.map((todo) => (
						<li
							key={todo.id}
							className={`flex justify-between items-center p-3 rounded-md ${
								todo.completed ? 'bg-green-50' : 'bg-gray-50'
							}`}
						>
							<div>
								<p
									className={`font-medium ${
										todo.completed ? 'line-through text-gray-500' : ''
									}`}
								>
									{todo.title}
								</p>
								{todo.description && (
									<p className='text-sm text-gray-500'>{todo.description}</p>
								)}
							</div>
							<span
								className={`text-xs px-2 py-1 rounded ${
									todo.completed
										? 'bg-green-100 text-green-700'
										: 'bg-yellow-100 text-yellow-700'
								}`}
							>
								{todo.completed ? 'Done' : 'Pending'}
							</span>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
