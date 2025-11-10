import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

export default function TodoDateFilter({
	startDate,
	endDate,
	today,
	setStartDateWithSwap,
	setEndDateWithSwap,
	swapTrigger,
	resetPage,
}) {
	const [Framer, setFramer] = useState(null);

	useEffect(() => {
		import('framer-motion').then((mod) => setFramer(mod));
	}, []);

	if (!Framer) return null;

	const clearDates = () => {
		setStartDateWithSwap('');
		setEndDateWithSwap('');
		resetPage(); // ← reset pagination only
		toast.success('Date filters cleared');
	};

	return (
		<AnimatePresence mode='wait'>
			<motion.div
				key={swapTrigger}
				initial={{ opacity: 0, backgroundColor: '#dbeafe' }} // light‑mode start
				animate={{
					opacity: 1,
					backgroundColor: 'var(--color-bg)', // respects dark mode
				}}
				exit={{ opacity: 0 }}
				transition={{ duration: 0.35 }}
				className='flex flex-wrap gap-3 mb-8 items-center'
			>
				{/* ---------- Start Date ---------- */}
				<input
					type='date'
					value={startDate}
					onChange={(e) => setStartDateWithSwap(e.target.value)}
					max={endDate || today}
					className={`
						border rounded-xl px-4 py-2.5 text-sm
						focus:outline-none focus:ring-2 focus:ring-primary
						transition
						bg-card border-green-700 hover:bg-(--color-green) text-foreground
						placeholder-muted-foreground cursor-pointer
					`}
				/>

				{/* ---------- End Date ---------- */}
				<input
					type='date'
					value={endDate}
					onChange={(e) => setEndDateWithSwap(e.target.value)}
					min={startDate}
					max={today}
					className={`
						border rounded-xl px-4 py-2.5 text-sm
						focus:outline-none focus:ring-2 focus:ring-primary
						transition
						bg-card border-green-700 hover:bg-(--color-green) text-foreground
						placeholder-muted-foreground cursor-pointer
					`}
				/>

				{/* ---------- Clear Button ---------- */}
				<button
					type='button'
					onClick={clearDates}
					className={`
						px-5 py-2 rounded-xl text-sm font-medium
						transition border border-rose-700 hover:bg-(--color-red)
						bg-muted hover:bg-muted/80 text-foreground cursor-pointer
					`}
				>
					Clear Dates
				</button>
			</motion.div>
		</AnimatePresence>
	);
}
