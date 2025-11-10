// src/components/todos/TodoListItems.jsx
import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Clock, Edit, Trash2 } from 'lucide-react';
import confetti from 'canvas-confetti';

// Helper: Human-readable date
const formatDate = (dateString) => {
	const date = new Date(dateString);
	const today = new Date();
	const isToday = date.toDateString() === today.toDateString();
	const isYesterday =
		new Date(today.setDate(today.getDate() - 1)).toDateString() ===
		date.toDateString();

	if (isToday) return 'Today';
	if (isYesterday) return 'Yesterday';

	return date.toLocaleDateString('en-US', {
		weekday: 'short',
		month: 'short',
		day: 'numeric',
	});
};

export default function TodoListItems({
	todos,
	toggle,
	isToggling,
	openEdit,
	openDelete,
}) {
	const [Motion, setMotion] = useState(null);

	useEffect(() => {
		import('framer-motion').then((mod) => setMotion(mod));
	}, []);

	const triggerConfetti = useCallback(() => {
		confetti({
			particleCount: 80,
			spread: 70,
			origin: { y: 0.6 },
			colors: ['#10b981', '#34d399', '#6ee7b7'],
		});
	}, []);

	const handleToggle = async (todo) => {
		if (isToggling(todo.id)) return;
		await toggle(todo.id, todo.completed);
		if (!todo.completed) triggerConfetti();
	};

	if (!Motion) return null;
	const { motion: MotionTag } = Motion;

	return (
		<ul className='space-y-4'>
			{todos.map((todo) => (
				<MotionTag.li
					key={todo.id}
					layout
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className={`group flex items-start justify-between gap-4 p-5 rounded-2xl border transition-all ${
						todo.completed
							? 'bg-emerald-500/5 border-emerald-500/30'
							: 'bg-card border-border hover:shadow-lg hover:border-primary/50'
					}`}
				>
					{/* LEFT: Title + Date + Description */}
					<div className='flex-1 min-w-0'>
						<p className='font-semibold text-lg text-foreground'>
							{todo.title}
							<span className='ml-2 text-sm font-normal text-muted-foreground'>
								— {formatDate(todo.createdAt)}
							</span>
						</p>

						{todo.description && (
							<p className='mt-1.5 text-sm text-muted-foreground whitespace-pre-wrap wrap-break-word'>
								{todo.description}
							</p>
						)}
					</div>

					{/* RIGHT: Status + Edit/Delete (Vertical Stack) */}
					<div className='flex flex-col items-end gap-2'>
						{/* Status Toggle Button */}
						<button
							onClick={() => handleToggle(todo)}
							disabled={isToggling(todo.id)}
							aria-label={
								todo.completed ? 'Mark as pending' : 'Mark as completed'
							}
							className={`relative px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 overflow-hidden min-w-[110px] ${
								todo.completed
									? 'bg-emerald-500/20 text-emerald-600 dark:bg-emerald-400/20 dark:text-emerald-300'
									: 'bg-amber-500/20 text-amber-600 dark:bg-amber-400/20 dark:text-amber-300'
							} hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-primary`}
						>
							<motion.div layout className='flex items-center gap-1.5'>
								<motion.span
									initial={false}
									animate={{ opacity: isToggling(todo.id) ? 0.5 : 1 }}
								>
									{todo.completed ? <>Check Completed</> : <>Clock Pending</>}
								</motion.span>
							</motion.div>

							<AnimatePresence>
								{isToggling(todo.id) && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										exit={{ scale: 0 }}
										className='absolute inset-0 flex items-center justify-center bg-black/10'
									>
										<div className='w-5 h-5 border-2 border-white/50 border-t-transparent rounded-full animate-spin' />
									</motion.div>
								)}
							</AnimatePresence>
						</button>

						{/* Edit & Delete Buttons (Below) */}
						<div className='flex items-center gap-1'>
							{!todo.completed && (
								<button
									onClick={() => openEdit(todo)}
									className='p-2 text-foreground hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition'
									title='Edit'
								>
									<Edit size={18} />
								</button>
							)}
							<button
								onClick={() => openDelete(todo)}
								className='p-2 text-foreground hover:text-red-500 hover:bg-red-500/10 rounded-xl transition'
								title='Delete'
							>
								<Trash2 size={18} />
							</button>
						</div>
					</div>
				</MotionTag.li>
			))}
		</ul>
	);
}
