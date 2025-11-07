import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import { useTodoForm } from '../../hooks/useTodoForm';

export default function TodoForm({ onTodoAdded }) {
	const { form, setForm, loading, success, handleChange, handleSubmit } =
		useTodoForm(onTodoAdded, false); // false = add mode

	return (
		<div className='relative'>
			<form
				onSubmit={handleSubmit}
				className='bg-white shadow-md rounded-2xl p-5 mb-6 flex flex-col gap-3'
			>
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

				<motion.button
					whileTap={{ scale: 0.97 }}
					disabled={loading}
					type='submit'
					className='bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition disabled:opacity-60'
				>
					{loading ? 'Adding...' : 'Add Todo'}
				</motion.button>
			</form>

			{/* ✅ Success Floating Animation */}
			<AnimatePresence>
				{success && (
					<motion.div
						initial={{ opacity: 0, y: 40, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -30, scale: 0.8 }}
						className='absolute inset-0 flex items-center justify-center bg-white/70 rounded-2xl backdrop-blur-sm'
					>
						<motion.div
							initial={{ scale: 0.8 }}
							animate={{ scale: 1 }}
							exit={{ scale: 0.7 }}
							transition={{ duration: 0.4 }}
							className='flex flex-col items-center text-green-600'
						>
							<CheckCircle2 size={48} className='mb-1' />
							<p className='font-semibold text-lg'>Todo Added!</p>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
