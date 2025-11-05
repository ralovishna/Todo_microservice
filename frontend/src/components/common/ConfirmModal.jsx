import { motion, AnimatePresence } from 'framer-motion';
import { Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function ConfirmModal({ show, todo, onCancel, onConfirm }) {
	const modalRef = useRef(null);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === 'Escape') onCancel();
			if (e.key === 'Enter') onConfirm();
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [onCancel, onConfirm]);

	if (!show) return null;

	const handleOverlayClick = (e) => {
		if (e.target === e.currentTarget) onCancel();
	};

	return (
		<AnimatePresence>
			<motion.div
				className='fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-md'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={handleOverlayClick}
			>
				<motion.div
					ref={modalRef}
					className='bg-white p-6 rounded-2xl shadow-2xl w-[90%] max-w-md text-center relative'
					initial={{ scale: 0.85, opacity: 0, y: 20 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0.9, opacity: 0 }}
					transition={{ type: 'spring', stiffness: 120, damping: 14 }}
				>
					<div className='flex justify-center mb-4'>
						<div className='bg-red-100 p-3 rounded-full'>
							<Trash2 className='text-red-600' size={28} />
						</div>
					</div>

					<h2 className='text-lg font-semibold text-gray-800 mb-2'>
						Delete Todo?
					</h2>
					<p className='text-gray-500 text-sm'>
						Are you sure you want to delete{' '}
						<span className='font-medium text-gray-700'>
							“{todo?.title || 'this task'}”
						</span>
						? This action{' '}
						<span className='text-red-500 font-medium'>cannot</span> be undone.
					</p>

					<div className='flex justify-end gap-3 mt-6'>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={onCancel}
							className='px-4 py-2 rounded-xl border border-gray-300 hover:bg-gray-100 transition'
						>
							Cancel
						</motion.button>

						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={onConfirm}
							className='px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition'
						>
							Delete
						</motion.button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
