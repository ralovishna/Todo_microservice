// components/todos/TodoCard.jsx
import { motion } from 'framer-motion';
import {
	Trash2,
	CheckCircle2,
	Circle,
	Clock,
	AlertTriangle,
	Edit3,
} from 'lucide-react';
import {
	format,
	parseISO,
	formatDistanceToNow,
	differenceInDays,
} from 'date-fns';
import { useState } from 'react';

export default function TodoCard({ todo, onToggle, onConfirmDelete, onEdit }) {
	const created = parseISO(todo.createdAt);
	const daysOld = differenceInDays(new Date(), created);
	const isCompleted = todo.completed;
	const isUrgent = !isCompleted && daysOld > 3;

	const getAgeBadge = () => {
		if (isCompleted) return null;
		let bg = '',
			text = '',
			icon = null;
		if (daysOld < 1) {
			bg = 'bg-green-100 text-green-700';
			text = 'Fresh';
		} else if (daysOld <= 3) {
			bg = 'bg-yellow-100 text-yellow-700';
			text = `${daysOld}d`;
		} else if (daysOld <= 7) {
			bg = 'bg-orange-100 text-orange-700';
			text = `${daysOld}d`;
			icon = <AlertTriangle className='w-3 h-3' />;
		} else {
			bg = 'bg-red-100 text-red-700';
			text = `${daysOld}d`;
			icon = <AlertTriangle className='w-3 h-3' />;
		}

		return (
			<span
				className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${bg}`}
			>
				{icon}
				{text}
			</span>
		);
	};

	const [showTooltip, setShowTooltip] = useState(false);
	const fullDate = format(created, "PPP 'at' p");

	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 20, scale: 0.95 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			exit={{ opacity: 0, scale: 0.9 }}
			transition={{ type: 'spring', stiffness: 200, damping: 20 }}
			className={`
        group relative p-5 rounded-2xl bg-white border
        ${isUrgent ? 'border-red-200' : 'border-gray-200'}
        shadow-sm hover:shadow-xl transition-all duration-300
        flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
      `}
		>
			{/* Checkbox + Content */}
			<div
				className='flex items-start gap-3 cursor-pointer select-none flex-1'
				onClick={() => onToggle(todo.id, !todo.completed)}
				role='button'
			>
				{todo.completed ? (
					<CheckCircle2 className='w-6 h-6 text-green-500 flex-shrink-0 mt-0.5' />
				) : (
					<Circle
						className={`w-6 h-6 flex-shrink-0 mt-0.5 ${
							isUrgent ? 'text-red-500' : 'text-gray-400'
						}`}
					/>
				)}

				<div className='flex-1 min-w-0'>
					<h3
						className={`font-semibold text-base truncate ${
							todo.completed ? 'line-through text-gray-400' : 'text-gray-900'
						}`}
					>
						{todo.title}
					</h3>
					{todo.description && (
						<p className='text-sm text-gray-600 mt-1 line-clamp-2'>
							{todo.description}
						</p>
					)}

					<div className='flex flex-wrap items-center gap-2 mt-3 text-xs text-gray-500'>
						<div className='flex items-center gap-1'>
							<Clock className='w-3.5 h-3.5' />
							<span
								className='relative'
								onMouseEnter={() => setShowTooltip(true)}
								onMouseLeave={() => setShowTooltip(false)}
							>
								{formatDistanceToNow(created, { addSuffix: true })}
								{showTooltip && (
									<div className='absolute bottom-full left-0 mb-2 w-max max-w-xs px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10'>
										{fullDate}
									</div>
								)}
							</span>
						</div>
						{getAgeBadge()}
					</div>
				</div>
			</div>

			{/* Action Buttons */}
			<div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity'>
				{/* Edit */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						onEdit(todo);
					}}
					className='p-2 rounded-full text-blue-600 hover:text-blue-700 hover:bg-blue-50 transition'
					aria-label='Edit todo'
				>
					<Edit3 className='w-5 h-5' />
				</button>

				{/* Delete */}
				<button
					onClick={(e) => {
						e.stopPropagation();
						onConfirmDelete(todo);
					}}
					className='p-2 rounded-full text-red-500 hover:text-red-700 hover:bg-red-50 transition'
					aria-label='Delete todo'
				>
					<Trash2 className='w-5 h-5' />
				</button>
			</div>
		</motion.div>
	);
}
