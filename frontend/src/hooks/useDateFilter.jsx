import toast from 'react-hot-toast';

export const useDateFilter = (
	setStartDate,
	setEndDate,
	startDate,
	endDate,
	setSwapTrigger
) => {
	const today = new Date().toISOString().split('T')[0];

	const validateAndSwap = (newStart, newEnd, label) => {
		if (!newStart || !newEnd) return { start: newStart, end: newEnd };
		if (newStart > newEnd) {
			toast.success(`Swapped dates – ${label} was after the other`);
			setSwapTrigger(Date.now());
			return { start: newEnd, end: newStart };
		}
		return { start: newStart, end: newEnd };
	};

	const setStartDateWithSwap = (value) => {
		if (!value) return setStartDate('');
		if (value > today) return toast.error('Start date cannot be in the future');
		const { start, end } = validateAndSwap(value, endDate, 'Start date');
		setStartDate(start);
		if (end !== endDate) setEndDate(end);
	};

	const setEndDateWithSwap = (value) => {
		if (!value) return setEndDate('');
		if (value > today) return toast.error('End date cannot be in the future');
		const { start, end } = validateAndSwap(startDate, value, 'End date');
		if (start !== startDate) setStartDate(start);
		setEndDate(end);
	};

	return { today, setStartDateWithSwap, setEndDateWithSwap };
};
