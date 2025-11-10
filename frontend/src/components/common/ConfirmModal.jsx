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
					className={`
						bg-(--color-card) p-6 rounded-2xl shadow-2xl
						w-[90%] max-w-md text-center relative
						transition-colors
					`}
					initial={{ scale: 0.85, opacity: 0, y: 20 }}
					animate={{ scale: 1, opacity: 1, y: 0 }}
					exit={{ scale: 0.9, opacity: 0 }}
					transition={{ type: 'spring', stiffness: 120, damping: 14 }}
				>
					<div className='flex justify-center mb-4'>
						<div className='bg-rose-600 p-3 rounded-full'>
							<Trash2 className='text-white' size={28} />
						</div>
					</div>

					<h2 className='text-lg font-semibold text-(--color-foreground) mb-2'>
						Delete Todo?
					</h2>
					<p className='text-muted-foreground text-sm'>
						Are you sure you want to delete{' '}
						<span className='font-medium text-(--color-foreground)'>
							“{todo?.title || 'this task'}”
						</span>
						? This action{' '}
						<span className='text-rose-600 font-medium'>cannot</span> be undone.
					</p>

					<div className='flex justify-end gap-3 mt-6'>
						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={onCancel}
							className={`
								px-4 py-2 rounded-xl border border-(--color-border)
								hover:bg-[color-mix(in srgb,var(--color-card),var(--color-border) 10%)]
								transition-colors
							`}
						>
							Cancel
						</motion.button>

						<motion.button
							whileTap={{ scale: 0.95 }}
							onClick={onConfirm}
							className={`
								px-4 py-2 rounded-xl bg-rose-600 text-white
								hover:bg-[color-mix(in srgb,var(--color-red),#00000020)]
								transition-colors
							`}
						>
							Delete
						</motion.button>
					</div>
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
