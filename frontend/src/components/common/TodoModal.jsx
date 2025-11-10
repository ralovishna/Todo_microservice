// src/components/common/TodoModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useApiErrorHandler } from '../../utils/handleApiError';
import toast from 'react-hot-toast';
import { API } from '../../api/endPoints';

export default function TodoModal({ show, onClose, onSuccess, todoToEdit }) {
	const isEditMode = !!todoToEdit;
	const [form, setForm] = useState({
		title: '',
		description: '',
		completed: false,
	});
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const handleApiError = useApiErrorHandler();

	// Sync form with todoToEdit
	useEffect(() => {
		if (todoToEdit) {
			setForm({
				title: todoToEdit.title,
				description: todoToEdit.description || '',
				completed: todoToEdit.completed,
			});
		} else {
			setForm({ title: '', description: '', completed: false });
		}
	}, [todoToEdit]);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		setForm((prev) => ({
			...prev,
			[name]: type === 'checkbox' ? checked : value,
		}));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.title.trim()) {
			toast.error('Title is required');
			return;
		}

		setLoading(true);
		try {
			const payload = {
				title: form.title.trim(),
				description: form.description.trim(),
				completed: form.completed,
			};

			if (isEditMode) {
				// PUT request with title, description, completed
				await axiosClient.put(`${API.TODOS.BASE}/${todoToEdit.id}`, payload);
			} else {
				// POST request (same payload)
				await axiosClient.post(API.TODOS.BASE, payload);
			}

			setSuccess(true);
			setTimeout(() => {
				onSuccess();
				setSuccess(false);
			}, 1500);
		} catch (err) {
			handleApiError(
				err,
				null,
				isEditMode ? 'Failed to update todo' : 'Failed to add todo'
			);
		} finally {
			setLoading(false);
		}
	};

	if (!show) return null;

	return (
		<AnimatePresence>
			<motion.div
				className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md p-4'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={(e) => e.target === e.currentTarget && onClose()}
			>
				<ModalContainer>
					{success ? (
						<SuccessMessage isEditMode={isEditMode} />
					) : (
						<TodoForm
							isEditMode={isEditMode}
							form={form}
							loading={loading}
							onChange={handleChange}
							onSubmit={handleSubmit}
							onClose={onClose}
						/>
					)}
				</ModalContainer>
			</motion.div>
		</AnimatePresence>
	);
}

/* ---------------------- SUBCOMPONENTS ---------------------- */

const ModalContainer = ({ children }) => (
	<motion.div
		initial={{ scale: 0.85, opacity: 0, y: 20 }}
		animate={{ scale: 1, opacity: 1, y: 0 }}
		exit={{ scale: 0.85, opacity: 0, y: 10 }}
		transition={{ type: 'spring', stiffness: 120, damping: 15 }}
		className='bg-card p-6 rounded-2xl shadow-xl w-full max-w-md'
	>
		{children}
	</motion.div>
);

const SuccessMessage = ({ isEditMode }) => (
	<motion.div
		initial={{ opacity: 0, scale: 0.9 }}
		animate={{ opacity: 1, scale: 1 }}
		exit={{ opacity: 0 }}
		className='flex flex-col items-center justify-center py-6 text-emerald-600'
	>
		<CheckCircle2 size={48} className='mb-2' />
		<p className='text-lg font-semibold text-foreground'>
			{isEditMode ? 'Todo Updated!' : 'Todo Added!'}
		</p>
	</motion.div>
);

const TodoForm = ({
	isEditMode,
	form,
	loading,
	onChange,
	onSubmit,
	onClose,
}) => (
	<>
		<h2 className='text-lg font-semibold mb-4 text-foreground'>
			{isEditMode ? 'Edit Todo' : 'Add New Todo'}
		</h2>

		<form onSubmit={onSubmit} className='flex flex-col gap-4'>
			{/* Title */}
			<input
				type='text'
				name='title'
				placeholder='Todo title'
				value={form.title}
				onChange={onChange}
				required
				className='w-full border border-border rounded-lg px-3 py-2 text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary transition'
			/>

			{/* Description */}
			<textarea
				name='description'
				placeholder='Description (optional)'
				value={form.description}
				onChange={onChange}
				rows={3}
				className='w-full border border-border rounded-lg px-3 py-2 text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary resize-none transition'
			/>

			{/* Status Toggle */}
			<label className='flex items-center gap-3 cursor-pointer select-none'>
				<input
					type='checkbox'
					name='completed'
					checked={form.completed}
					onChange={onChange}
					className='w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary border-border cursor-pointer'
				/>
				<span className='text-foreground font-medium'>
					{form.completed ? 'Completed' : 'Pending'}
				</span>
			</label>

			{/* Buttons */}
			<div className='flex justify-end gap-3 mt-4'>
				<button
					type='button'
					onClick={onClose}
					className='px-4 py-2 rounded-xl border border-border hover:bg-muted transition'
				>
					Cancel
				</button>

				<motion.button
					whileTap={{ scale: 0.95 }}
					type='submit'
					disabled={loading}
					className='px-4 py-2 rounded-xl bg-primary text-white hover:bg-primary/90 transition disabled:opacity-60'
				>
					{loading
						? isEditMode
							? 'Updating...'
							: 'Adding...'
						: isEditMode
						? 'Update Todo'
						: 'Add Todo'}
				</motion.button>
			</div>
		</form>
	</>
);
