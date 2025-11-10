import { useState, useCallback } from 'react';
import axiosClient from '../api/axiosClient';
import { useApiErrorHandler } from '../utils/handleApiError';
import { API } from '../api/endPoints';
import toast from 'react-hot-toast';

export const useTodoToggle = (setTodos) => {
	const [togglingId, setTogglingId] = useState(null);
	const handleApiError = useApiErrorHandler();

	const toggle = useCallback(
		async (id, currentStatus) => {
			if (togglingId === id) return;
			setTogglingId(id);
			try {
				await axiosClient.patch(`${API.TODOS.BASE}/${id}`, {
					completed: !currentStatus,
				});
				setTodos((prev) =>
					prev.map((t) =>
						t.id === id ? { ...t, completed: !currentStatus } : t
					)
				);
				toast.success(
					!currentStatus ? 'Todo completed!' : 'Todo marked pending'
				);
			} catch (err) {
				handleApiError(err, null, 'Failed to update todo');
			} finally {
				setTogglingId(null);
			}
		},
		[togglingId, setTodos, handleApiError]
	);

	return { toggle, isToggling: (id) => togglingId === id };
};
