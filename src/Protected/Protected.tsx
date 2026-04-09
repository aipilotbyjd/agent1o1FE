import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@/context/authContext';
import { LogoDark } from '@/assets/images';

const Protected = ({ role: _role }: { role?: string }) => {
	const { isAuthenticated, userData, isLoading } = useAuth();

	if (isLoading) {
		return (
			<div className='flex h-full items-center justify-center'>
				<img src={LogoDark} alt='' className='h-24' />
			</div>
		);
	}
	if (!isAuthenticated || !userData) {
		return <Navigate to='/login' />;
	}

	return <Outlet />;
};

export default Protected;
