// src/components/TodoPagination.jsx
import { Suspense, lazy } from 'react';

const Pagination = lazy(() =>
	import('@mui/material').then((m) => ({ default: m.Pagination }))
);

export default function TodoPagination({ totalPages, page, onChange }) {
	if (totalPages <= 1) return null;

	return (
		<div className='mt-8 flex justify-center'>
			<Suspense fallback={<div>Loading pagination...</div>}>
				<Pagination
					count={totalPages}
					page={page}
					onChange={onChange}
					color='primary'
					size='large'
					showFirstButton
					showLastButton
				/>
			</Suspense>
		</div>
	);
}
