import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useTodoForm } from '../../hooks/useTodoForm';

export default function TodoModal({ show, onClose, onSuccess, todoToEdit }) {
	const isEditMode = !!todoToEdit;
	const { form, setForm, loading, success, handleChange, handleSubmit } =
		useTodoForm(onSuccess, isEditMode, todoToEdit?.id);

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
				<motion.div
					initial={{ scale: 0.85, opacity: 0, y: 20 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0.85, opacity: 0, y: 10 }}
					transition={{ type: 'spring', stiffness: 120, damping: 15 }}
					className='bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md relative'
				>
					{success ? (
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
					) : (
						<>
							<h2 className='text-lg font-semibold mb-4 text-gray-800'>
								{isEditMode ? 'Edit Todo' : 'Add New Todo'}
							</h2>
							<form onSubmit={handleSubmit} className='flex flex-col gap-3'>
								<input
									type='text'
									name='title'
									placeholder='Todo title'
									value={form.title}
									onChange={handleChange}
									className='border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none'
								/>
								<textarea
									name='description'
									placeholder='Description (optional)'
									value={form.description}
									onChange={handleChange}
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
					)}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
