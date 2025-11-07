import { useState, useEffect, useCallback } from 'react';
import axiosClient from '../../api/axiosClient';
import { useApiErrorHandler } from '../../utils/handleApiError';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import TodoModal from '../../components/common/TodoModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Navbar from '../../components/layout/Navbar';
import { API } from '../../api/endPoints';

// Reusable: Date validation
const useDateFilter = () => {
	const today = new Date().toISOString().split('T')[0];

	const validateDate = (date, label) => {
		if (!date || date <= today) return date;
		toast.error(`${label} cannot be in the future`);
		return '';
	};

	return { today, validateDate };
};

// Reusable: Toggle logic
const useTodoToggle = (setTodos) => {
	const [togglingId, setTogglingId] = useState(null);
	const handleApiError = useApiErrorHandler();

	const toggle = useCallback(
		async (id, currentStatus) => {
			if (togglingId === id) return;
			setTogglingId(id);

			try {
				await axiosClient.patch(`${API.TODOS.BASE}/${id}`, {
					completed: !currentStatus,
				});

				setTodos((prev) =>
					prev.map((t) =>
						t.id === id ? { ...t, completed: !currentStatus } : t
					)
				);

				toast.success(
					!currentStatus ? 'Todo completed!' : 'Todo marked pending'
				);
			} catch (err) {
				handleApiError(err, null, 'Failed to update todo');
			} finally {
				setTogglingId(null);
			}
		},
		[togglingId, setTodos, handleApiError]
	);

	return { toggle, isToggling: (id) => togglingId === id };
};

export default function TodoList() {
	const [todos, setTodos] = useState([]);
	const [filter, setFilter] = useState('pending');
	const [search, setSearch] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [showAddEditModal, setShowAddEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [todoToEdit, setTodoToEdit] = useState(null);
	const [todoToDelete, setTodoToDelete] = useState(null);
	const [refreshKey, setRefreshKey] = useState(0);

	const { today, validateDate } = useDateFilter();
	const { toggle, isToggling } = useTodoToggle(setTodos);
	const handleApiError = useApiErrorHandler();

	// Refresh after mutation
	const refresh = useCallback(() => {
		setShowAddEditModal(false);
		setTodoToEdit(null);
		setRefreshKey((k) => k + 1);
	}, []);

	useEffect(() => {
		const fetchTodos = async () => {
			try {
				const params = {};
				if (filter && filter !== 'all') params.status = filter;
				if (search.trim()) params.search = search.trim();
				if (startDate) params.startDate = startDate;
				if (endDate) params.endDate = endDate;

				const { data } = await axiosClient.get(API.TODOS.BASE, { params });
				setTodos(data);
			} catch (err) {
				handleApiError(err, null, 'Failed to load todos');
			}
		};

		fetchTodos();
	}, [filter, search, startDate, endDate, refreshKey]);

	// Modal Handlers
	const openAdd = () => {
		setTodoToEdit(null);
		setShowAddEditModal(true);
	};

	const openEdit = (todo) => {
		setTodoToEdit(todo);
		setShowAddEditModal(true);
	};

	const openDelete = (todo) => {
		setTodoToDelete(todo);
		setShowDeleteModal(true);
	};

	const confirmDelete = async () => {
		if (!todoToDelete) return;

		try {
			await axiosClient.delete(`${API.TODOS.BASE}/${todoToDelete.id}`);
			setTodos((prev) => prev.filter((t) => t.id !== todoToDelete.id));
			toast.success('Todo deleted');
		} catch (err) {
			handleApiError(err, null, 'Failed to delete todo');
		} finally {
			setShowDeleteModal(false);
			setTodoToDelete(null);
		}
	};

	return (
		<>
			<Navbar onSearchChange={setSearch} />

			<main className='max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8'>
				<section className='bg-white rounded-2xl shadow-xl p-6 sm:p-8'>
					{/* Header */}
					<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
						<h2 className='text-3xl font-bold text-gray-800'>My Todos</h2>
						<button
							onClick={openAdd}
							className='flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg font-medium'
						>
							<Plus size={20} />
							Add Todo
						</button>
					</div>

					{/* Filters */}
					<div className='flex flex-wrap gap-3 mb-8'>
						{['pending', 'all', 'completed'].map((f) => (
							<button
								key={f}
								onClick={() => setFilter(f)}
								className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
									filter === f
										? 'bg-blue-600 text-white shadow-md'
										: 'bg-gray-100 hover:bg-gray-200 text-gray-700'
								}`}
							>
								{f.charAt(0).toUpperCase() + f.slice(1)}
							</button>
						))}
					</div>

					{/* Date Filters */}
					<div className='flex flex-wrap gap-3 mb-8 items-center'>
						<input
							type='date'
							value={startDate}
							onChange={(e) =>
								setStartDate(validateDate(e.target.value, 'Start date'))
							}
							max={today}
							className='border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition'
						/>
						<input
							type='date'
							value={endDate}
							onChange={(e) =>
								setEndDate(validateDate(e.target.value, 'End date'))
							}
							max={today}
							className='border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition'
						/>
						<button
							onClick={() => {
								setStartDate('');
								setEndDate('');
								toast.success('Date filters cleared');
							}}
							className='px-5 py-2 bg-gray-100 rounded-xl text-sm hover:bg-gray-200 transition font-medium'
						>
							Clear Dates
						</button>
					</div>
					<p className='text-xs text-gray-500 -mt-6 mb-6 ml-1'>
						Only past and present dates are allowed
					</p>

					{/* Stats Bar */}
					<div className='mb-6'>
						{todos.length > 0 && (
							<p className='text-sm font-medium text-gray-700'>
								{startDate || endDate ? (
									<>
										<span className='text-blue-600'>
											{startDate
												? new Date(startDate).toLocaleDateString('en-US', {
														month: 'short',
														day: 'numeric',
												  })
												: '...'}{' '}
											–{' '}
											{endDate
												? new Date(endDate).toLocaleDateString('en-US', {
														month: 'short',
														day: 'numeric',
												  })
												: '...'}
										</span>
										<span className='mx-2'>•</span>
									</>
								) : null}
								<span className='text-amber-600'>
									{todos.filter((t) => !t.completed).length} pending
								</span>
								<span className='mx-2'>•</span>
								<span className='text-green-600'>
									{todos.filter((t) => t.completed).length} completed
								</span>
								<span className='mx-2'>•</span>
								<span className='font-semibold text-gray-800'>
									{todos.length} total
								</span>
							</p>
						)}
					</div>

					{/* Todo List */}
					{todos.length === 0 ? (
						<EmptyState />
					) : (
						<TodoListItems
							todos={todos}
							onToggle={toggle}
							isToggling={isToggling}
							onEdit={openEdit}
							onDelete={openDelete}
						/>
					)}
				</section>
			</main>

			{/* Modals */}
			<TodoModal
				show={showAddEditModal}
				onClose={() => {
					setShowAddEditModal(false);
					setTodoToEdit(null);
				}}
				onSuccess={refresh}
				todoToEdit={todoToEdit}
			/>

			<ConfirmModal
				show={showDeleteModal}
				todo={todoToDelete}
				onCancel={() => {
					setShowDeleteModal(false);
					setTodoToDelete(null);
				}}
				onConfirm={confirmDelete}
			/>
		</>
	);
}

// Sub-components
const EmptyState = () => (
	<div className='text-center py-16'>
		<div className='bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4'>
			<span className='text-3xl'>Empty</span>
		</div>
		<p className='text-gray-500 text-lg'>No todos found.</p>
		<p className='text-sm text-gray-400 mt-1'>
			Create your first todo to get started!
		</p>
	</div>
);

const TodoListItems = ({ todos, onToggle, isToggling, onEdit, onDelete }) => (
	<ul className='space-y-4'>
		{todos.map((todo) => (
			<li
				key={todo.id}
				className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all ${
					todo.completed
						? 'bg-green-50 border-green-200'
						: 'bg-gray-50 border-gray-200 hover:shadow-lg hover:border-gray-300'
				}`}
			>
				{/* Toggle */}
				<label className='mt-1 cursor-pointer'>
					<input
						type='checkbox'
						checked={todo.completed}
						onChange={() => onToggle(todo.id, todo.completed)}
						disabled={isToggling(todo.id)}
						className='w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer transition'
					/>
				</label>

				{/* Content */}
				<div className='flex-1 min-w-0'>
					<p
						className={`font-semibold text-lg transition-all ${
							todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
						}`}
					>
						{todo.title}
					</p>
					{todo.description && (
						<p className='text-sm text-gray-600 mt-1.5 break-words whitespace-pre-wrap'>
							{todo.description}
						</p>
					)}
					<p className='text-xs text-gray-400 mt-2 flex items-center gap-1'>
						<span>Calendar</span>{' '}
						{new Date(todo.createdAt).toLocaleDateString('en-US', {
							weekday: 'short',
							month: 'short',
							day: 'numeric',
						})}
					</p>
				</div>

				{/* Status + Actions */}
				<div className='flex items-center gap-3'>
					<span
						className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
							todo.completed
								? 'bg-green-100 text-green-700'
								: 'bg-amber-100 text-amber-700'
						}`}
					>
						{todo.completed ? 'Completed' : 'Pending'}
					</span>

					<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
						<button
							onClick={() => onEdit(todo)}
							className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition'
							title='Edit'
						>
							<Edit size={18} />
						</button>
						<button
							onClick={() => onDelete(todo)}
							className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition'
							title='Delete'
						>
							<Trash2 size={18} />
						</button>
					</div>
				</div>
			</li>
		))}
	</ul>
);
