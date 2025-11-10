// src/components/TodoPagination.jsx
import { Suspense, lazy } from 'react';

const Pagination = lazy(() =>
	import('@mui/material').then((m) => ({ default: m.Pagination }))
);

export default function TodoPagination({ totalPages, page, onChange }) {
	if (totalPages <= 1) return null;

	return (
		<div
			className='mt-8 flex justify-center'
			style={{
				backgroundColor: 'var(--color-bg)',
				color: 'var(--color-fg)',
				transition: 'background-color .2s, color .2s',
			}}
		>
			<Suspense
				fallback={
					<div className='text-sm text-muted-foreground'>
						Loading pagination...
					</div>
				}
			>
				<Pagination
					count={totalPages}
					page={page}
					onChange={onChange}
					sx={{
						'& .MuiPaginationItem-root': {
							color: 'var(--color-fg)',
								borderRadius: '8px',
							'&.Mui-selected': {
								backgroundColor: 'var(--color-primary)',
								color: 'var(--color-bg)',
							},
							'&:hover': {
								backgroundColor:
									'color-mix(in srgb, var(--color-card), var(--color-primary) 10%)',
							},
						},
					}}
					size='large'
					showFirstButton
					showLastButton
				/>
			</Suspense>
		</div>
	);
}
