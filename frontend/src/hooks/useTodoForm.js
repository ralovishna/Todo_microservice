import { useState } from 'react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import axiosClient from '../api/axiosClient';
import { API } from '../api/endPoints';
import { useApiErrorHandler } from '../utils/handleApiError';

export function useTodoForm(onSuccess, isEditMode = false, todoId = null) {
	const [form, setForm] = useState({ title: '', description: '' });
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const handleApiError = useApiErrorHandler();

	const handleChange = (e) =>
		setForm({ ...form, [e.target.name]: e.target.value });

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!form.title.trim()) return toast.error('Title is required');

		try {
			setLoading(true);
			if (isEditMode) {
				await axiosClient.put(`${API.TODOS.BASE}/${todoId}`, form);
				toast.success('Todo updated!');
			} else {
				await axiosClient.post(API.TODOS.BASE, form);
				toast.success('Todo added!');
			}

			setSuccess(true);
			if (!isEditMode) {
				confetti({
					particleCount: 50,
					spread: 60,
					startVelocity: 20,
					origin: { y: 0.6 },
					colors: ['#3B82F6', '#22C55E', '#FACC15'],
				});
			}

			setTimeout(() => {
				setSuccess(false);
				onSuccess?.();
			}, 1000);
		} catch (err) {
			handleApiError(
				err,
				null,
				isEditMode ? 'Failed to update' : 'Failed to add'
			);
		} finally {
			setLoading(false);
		}
	};

	return { form, setForm, loading, success, handleChange, handleSubmit };
}
