// src/pages/auth/Register.jsx
import { useNavigate } from 'react-router-dom';
import { API } from '../../api/endPoints';
import AuthForm from '../../components/common/AuthForm';

export default function Register() {
	const navigate = useNavigate();

	return (
		<AuthForm
			role='register'
			endpoint={API.AUTH.REGISTER}
			linkTo='/login'
			linkText='Sign In'
			mainColor='green'
			onSuccess={() => navigate('/login')}
		/>
	);
}
