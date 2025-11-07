import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useApiErrorHandler } from '../../utils/handleApiError';
import toast from 'react-hot-toast';
import { API } from '../../api/endPoints';

export default function TodoModal({ show, onClose, onSuccess, todoToEdit }) {
	const isEditMode = !!todoToEdit;
	const [form, setForm] = useState({ title: '', description: '' });
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const handleApiError = useApiErrorHandler();

	useEffect(() => {
		if (todoToEdit) {
			setForm({
				title: todoToEdit.title,
				description: todoToEdit.description || '',
			});
		} else {
			setForm({ title: '', description: '' });
		}
	}, [todoToEdit]);

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.title.trim()) {
			toast.error('Title is required');
			return;
		}
		setLoading(true);
		try {
			if (isEditMode) {
				await axiosClient.put(`${API.TODOS.BASE}/${todoToEdit.id}`, form);
			} else {
				await axiosClient.post(API.TODOS.BASE, form);
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
				className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md'
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
		className='bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md relative'
	>
		{children}
	</motion.div>
);

const SuccessMessage = ({ isEditMode }) => (
	<motion.div
		initial={{ opacity: 0, scale: 0.9 }}
		animate={{ opacity: 1, scale: 1 }}
		exit={{ opacity: 0 }}
		className='flex flex-col items-center justify-center py-6 text-green-600'
	>
		<CheckCircle2 size={48} className='mb-2' />
		<p className='text-lg font-semibold'>
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
		<h2 className='text-lg font-semibold mb-4 text-gray-800'>
			{isEditMode ? 'Edit Todo' : 'Add New Todo'}
		</h2>

		<form onSubmit={onSubmit} className='flex flex-col gap-3'>
			<input
				type='text'
				name='title'
				placeholder='Todo title'
				value={form.title}
				onChange={onChange}
				className='border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none'
			/>

			<textarea
				name='description'
				placeholder='Description (optional)'
				value={form.description}
				onChange={onChange}
				rows={2}
				className='border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none resize-none'
			/>

			<div className='flex justify-end gap-3 mt-4'>
				<button
					type='button'
					onClick={onClose}
					className='px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition'
				>
					Cancel
				</button>

				<motion.button
					whileTap={{ scale: 0.95 }}
					type='submit'
					disabled={loading}
					className='px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-60'
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
