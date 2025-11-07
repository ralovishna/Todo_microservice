import React from 'react';
import { useNavigate } from 'react-router-dom';
import { API } from '../../api/endPoints';
import AuthForm from '../../components/common/AuthForm';

export default function Login() {
	const navigate = useNavigate();

	return (
		<AuthForm
			role='login'
			endpoint={API.AUTH.LOGIN}
			linkTo='/register'
			linkText='Register'
			mainColor='blue'
			onSuccess={() => {}}
		/>
	);
}
