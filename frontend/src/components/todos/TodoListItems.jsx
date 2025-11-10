// src/components/TodoListItems.jsx
import { Suspense, useEffect, useState } from 'react';
import { Edit, Trash2 } from 'lucide-react';

export default function TodoListItems({
	todos,
	toggle,
	isToggling,
	openEdit,
	openDelete,
}) {
	const [motion, setMotion] = useState(null);

	useEffect(() => {
		import('framer-motion').then((mod) => setMotion(() => mod.motion));
	}, []);

	if (!motion) return null;

	return (
		<ul className='space-y-4'>
			{todos.map((todo) => (
				<motion.li
					key={todo.id}
					layout
					initial={{ opacity: 0, y: 10 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: -10 }}
					className={`group flex items-start gap-4 p-5 rounded-2xl border transition-all ${
						todo.completed
							? 'bg-green-50 border-green-200'
							: 'bg-gray-50 border-gray-200 hover:shadow-lg hover:border-gray-300'
					}`}
				>
					<label className='mt-1 cursor-pointer'>
						<input
							type='checkbox'
							checked={todo.completed}
							onChange={() => toggle(todo.id, todo.completed)}
							disabled={isToggling(todo.id)}
							className='w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 cursor-pointer transition'
						/>
					</label>

					<div className='flex-1 min-w-0'>
						<p
							className={`font-semibold text-lg transition-all ${
								todo.completed ? 'line-through text-gray-500' : 'text-gray-800'
							}`}
						>
							{todo.title}
						</p>
						{todo.description && (
							<p className='text-sm text-gray-600 mt-1.5 break-words whitespace-pre-wrap'>
								{todo.description}
							</p>
						)}
						<p className='text-xs text-gray-400 mt-2 flex items-center gap-1'>
							Calendar{' '}
							{new Date(todo.createdAt).toLocaleDateString('en-US', {
								weekday: 'short',
								month: 'short',
								day: 'numeric',
							})}
						</p>
					</div>

					<div className='flex items-center gap-3'>
						<span
							className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
								todo.completed
									? 'bg-green-100 text-green-700'
									: 'bg-amber-100 text-amber-700'
							}`}
						>
							{todo.completed ? 'Completed' : 'Pending'}
						</span>

						<div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
							<button
								onClick={() => openEdit(todo)}
								className='p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition'
								title='Edit'
							>
								<Edit size={18} />
							</button>
							<button
								onClick={() => openDelete(todo)}
								className='p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition'
								title='Delete'
							>
								<Trash2 size={18} />
							</button>
						</div>
					</div>
				</motion.li>
			))}
		</ul>
	);
}
