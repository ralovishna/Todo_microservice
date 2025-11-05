import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import TodoModal from '../../components/common/TodoModal';
import ConfirmModal from '../../components/common/ConfirmModal';
import TodoCard from '../../components/todos/TodoCard';
import axiosClient from '../../api/axiosClient';
import Navbar from '../../components/layout/Navbar';

export default function TodoList() {
	const [todos, setTodos] = useState([]);
	const [loading, setLoading] = useState(true);
	const [showModal, setShowModal] = useState(false);
	const [todoToEdit, setTodoToEdit] = useState(null);
	const [showConfirm, setShowConfirm] = useState(false);
	const [selectedTodo, setSelectedTodo] = useState(null);
	const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

	// -------------------------------------------------
	// FETCH TODOS (centralized)
	// -------------------------------------------------
	const fetchTodos = async () => {
		setLoading(true);
		try {
			const res = await axiosClient.get('/api/todos');
			setTodos(res.data);
		} catch {
			toast.error('Failed to load todos');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTodos();
	}, []);

	// -------------------------------------------------
	// ADD / EDIT / TOGGLE / DELETE
	// -------------------------------------------------
	const handleTodoAdded = async () => {
		await fetchTodos();
		setShowSuccessOverlay(true);

		import('canvas-confetti').then((confetti) => {
			confetti.default({
				particleCount: 70,
				spread: 80,
				origin: { y: 0.6 },
				colors: ['#22C55E', '#3B82F6', '#FACC15'],
				zIndex: 2000,
			});
		});

		setTimeout(() => setShowSuccessOverlay(false), 1500);
	};

	const toggleTodo = async (id, completed) => {
		try {
			await axiosClient.patch(`/api/todos/${id}`, { completed: !completed });
			await fetchTodos(); // refresh after toggle
			toast.success('Todo updated!');
		} catch (err) {
			console.error('Toggle Todo Error:', err);
			toast.error('Failed to update todo');
		}
	};

	const deleteTodo = async (id) => {
		try {
			await axiosClient.delete(`/api/todos/${id}`);
			await fetchTodos(); // refresh after delete
			toast.success('Todo deleted');
		} catch {
			toast.error('Failed to delete');
		}
	};

	const handleConfirmDelete = (todo) => {
		setSelectedTodo(todo);
		setShowConfirm(true);
	};

	const handleDelete = () => {
		if (selectedTodo) deleteTodo(selectedTodo.id);
		setShowConfirm(false);
		setSelectedTodo(null);
	};

	const openAddModal = () => {
		setTodoToEdit(null);
		setShowModal(true);
	};

	const openEditModal = (todo) => {
		setTodoToEdit(todo);
		setShowModal(true);
	};

	const handleSuccess = async () => {
		await fetchTodos();
	};

	// -------------------------------------------------
	// UI
	// -------------------------------------------------
	return (
		<>
			<Navbar />
			<main className='max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8'>
				{/* Header + Add button */}
				<div className='flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8'>
					<h1 className='text-2xl font-bold text-gray-800'>My Todos</h1>
					<button
						onClick={openAddModal}
						className='mt-4 sm:mt-0 flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl transition shadow-sm hover:shadow'
					>
						<Plus size={18} /> Add Todo
					</button>
				</div>

				{/* Loading skeleton */}
				{loading ? (
					<div className='space-y-4'>
						{[...Array(4)].map((_, i) => (
							<div
								key={i}
								className='bg-gray-100 rounded-2xl p-4 animate-pulse'
							>
								<div className='h-5 bg-gray-300 rounded w-3/4 mb-2'></div>
								<div className='h-4 bg-gray-200 rounded w-1/2'></div>
							</div>
						))}
					</div>
				) : (
					<>
						<AnimatePresence>
							{showSuccessOverlay && (
								<motion.div
									initial={{ opacity: 0, y: 30, scale: 0.9 }}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -20, scale: 0.8 }}
									className='fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm pointer-events-none'
								>
									<motion.div
										initial={{ scale: 0.8 }}
										animate={{ scale: 1 }}
										className='flex flex-col items-center text-green-600'
									>
										<svg
											className='w-16 h-16 mb-2'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
											/>
										</svg>
										<p className='text-xl font-semibold'>Todo Added!</p>
									</motion.div>
								</motion.div>
							)}
						</AnimatePresence>

						<div className='space-y-4'>
							{todos.length === 0 ? (
								<div className='text-center py-12'>
									<div className='bg-gray-200 border-2 border-dashed rounded-xl w-32 h-32 mx-auto mb-4' />
									<p className='text-gray-500 italic'>
										No todos yet — start by adding one!
									</p>
								</div>
							) : (
								todos.map((todo) => (
									<TodoCard
										key={todo.id}
										todo={todo}
										onToggle={toggleTodo}
										onConfirmDelete={handleConfirmDelete}
										onEdit={openEditModal}
									/>
								))
							)}
						</div>
					</>
				)}
			</main>

			{/* ---------- MODALS ---------- */}
			<TodoModal
				show={showModal}
				onClose={() => setShowModal(false)}
				onSuccess={handleSuccess}
				todoToEdit={todoToEdit}
			/>
			<ConfirmModal
				show={showConfirm}
				todo={selectedTodo}
				onCancel={() => setShowConfirm(false)}
				onConfirm={handleDelete}
			/>
		</>
	);
}
