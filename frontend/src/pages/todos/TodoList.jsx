import { useState, useEffect, useCallback, useMemo } from 'react';
import axiosClient from '../../api/axiosClient';
import { useApiErrorHandler } from '../../utils/handleApiError';
import toast from 'react-hot-toast';
import { Plus, Edit, Trash2 } from 'lucide-react';
import TodoModal from '../../components/common/TodoModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import Navbar from '../../components/layout/Navbar';
import { API } from '../../api/endPoints';

import { useDateFilter } from '../../hooks/useDateFilter';
import { useTodoToggle } from '../../hooks/useTodoToggle';

import TodoDateFilter from '../../components/todos/TodoDateFilter';
import TodoListItems from '../../components/todos/TodoListItems';
import TodoPagination from '../../components/todos/TodoPagination';

export default function TodoList() {
	// ----- state -----
	const [todos, setTodos] = useState([]);
	const [page, setPage] = useState(1);
	const [totalPages, setTotalPages] = useState(1);
	const [filter, setFilter] = useState('pending');
	const [search, setSearch] = useState('');
	const [startDate, setStartDate] = useState('');
	const [endDate, setEndDate] = useState('');
	const [swapTrigger, setSwapTrigger] = useState(0);

	const [showAddEditModal, setShowAddEditModal] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [todoToEdit, setTodoToEdit] = useState(null);
	const [todoToDelete, setTodoToDelete] = useState(null);
	const [refreshKey, setRefreshKey] = useState(0);

	// ----- hooks -----
	const { today, setStartDateWithSwap, setEndDateWithSwap } = useDateFilter(
		setStartDate,
		setEndDate,
		startDate,
		endDate,
		setSwapTrigger
	);
	const { toggle, isToggling } = useTodoToggle(setTodos);
	const handleApiError = useApiErrorHandler();

	// ----- helpers -----
	const refresh = useCallback(() => {
		setShowAddEditModal(false);
		setTodoToEdit(null);
		setPage(1);
		setRefreshKey((k) => k + 1);
	}, []);

	const resetPage = () => setPage(1);

	// ----- fetch todos -----
	useEffect(() => {
		const fetchTodos = async () => {
			try {
				const params = new URLSearchParams();
				if (filter && filter !== 'all') params.append('status', filter);
				if (search.trim()) params.append('search', search.trim());
				if (startDate) params.append('startDate', startDate);
				if (endDate) params.append('endDate', endDate);
				params.append('page', String(page));
				params.append('size', '10');

				const { data } = await axiosClient.get(API.TODOS.BASE, { params });
				setTodos(data.content || []);
				setTotalPages(data.totalPages || 1);
			} catch (err) {
				handleApiError(err, null, 'Failed to load todos');
			}
		};
		fetchTodos();
	}, [filter, search, startDate, endDate, page, refreshKey]);

	// ----- modal handlers -----
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

	const handlePageChange = (_, value) => setPage(value);

	// ----- stats -----
	const stats = useMemo(() => {
		const pending = todos.filter((t) => !t.completed).length;
		const completed = todos.filter((t) => t.completed).length;
		return { pending, completed, total: todos.length };
	}, [todos]);

	// ----- UI -----
	return (
		<>
			<Navbar onSearchChange={setSearch} />
			{/* <div className='bg-card text-foreground bg-muted border-border text-primary hidden' /> */}
			<main className='max-w-4xl mx-auto mt-8 px-4 sm:px-6 lg:px-8'>
				<section className='bg-card rounded-2xl shadow-xl p-6 sm:p-8'>
					{/* Header */}
					<div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
						<h2 className='text-3xl font-bold text-foreground'>My Todos</h2>
						<button
							onClick={openAdd}
							className='flex items-center gap-2 px-5 py-2.5 bg-linear-to-r from-primary to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg cursor-pointer font-medium'
						>
							<Plus size={20} /> Add Todo
						</button>
					</div>

					{/* Status filter */}
					<div className='flex flex-wrap gap-3 mb-8'>
						{['pending', 'all', 'completed'].map((f) => (
							<button
								key={f}
								onClick={() => {
									setFilter(f);
									resetPage();
									2;
								}}
								className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
									filter === f
										? 'bg-blue-500 text-white shadow-md'
										: 'bg-muted hover:bg-(--color-blue) border-blue-700 border text-foreground'
								}`}
							>
								{f.charAt(0).toUpperCase() + f.slice(1)}
							</button>
						))}
					</div>

					{/* Date filter */}
					<TodoDateFilter
						startDate={startDate}
						endDate={endDate}
						today={today}
						setStartDateWithSwap={setStartDateWithSwap}
						setEndDateWithSwap={setEndDateWithSwap}
						swapTrigger={swapTrigger}
						resetPage={resetPage}
					/>

					<p className='text-xs text-muted-foreground -mt-6 mb-6 ml-1'>
						Only past and present dates are allowed
					</p>

					{/* Stats */}
					{todos.length > 0 && (
						<p className='text-sm font-medium text-foreground flex flex-wrap items-center gap-x-3 gap-y-1 mb-6'>
							{startDate || endDate ? (
								<span className='text-primary'>
									{startDate
										? new Date(startDate).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
										  })
										: '...'}
									{' to '}
									{endDate
										? new Date(endDate).toLocaleDateString('en-US', {
												month: 'short',
												day: 'numeric',
										  })
										: '...'}
								</span>
							) : (
								<span className='text-blue-500 italic'>All time</span>
							)}
							<span className='text-amber-600 dark:text-amber-400'>
								{stats.pending} pending
							</span>
							<span className='text-green-600 dark:text-green-400'>
								{stats.completed} completed
							</span>
							<span className='font-semibold text-foreground'>
								{stats.total} total
							</span>
						</p>
					)}

					{/* List / Empty */}
					{todos.length === 0 ? (
						<div className='text-center py-16'>
							<div className='bg-muted w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4'>
								<span className='text-3xl'>Empty</span>
							</div>
							<p className='text-muted-foreground text-lg'>No todos found.</p>
							<p className='text-sm text-muted-foreground/70 mt-1'>
								Create your first todo to get started!
							</p>
						</div>
					) : (
						<>
							<TodoListItems
								todos={todos}
								toggle={toggle}
								isToggling={isToggling}
								openEdit={openEdit}
								openDelete={openDelete}
							/>
							<TodoPagination
								totalPages={totalPages}
								page={page}
								onChange={handlePageChange}
							/>
						</>
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
