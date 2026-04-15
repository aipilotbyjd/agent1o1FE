import { Navigate, Outlet, useLocation } from 'react-router';
import { useAuth } from '@/context/authContext';
import { LogoDark } from '@/assets/images';
import { hasValidToken } from '@/api/utils/token.manager';

interface ProtectedProps {
	role?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const Protected = ({ role: _role }: ProtectedProps) => {
	const { isLoading, isAuthenticated } = useAuth();
	const location = useLocation();

	// Check token validity
	const hasToken = hasValidToken();

	// Show loading state — also treat "has token but user not loaded yet" as loading
	if (isLoading || (hasToken && !isAuthenticated)) {
		return (
			<div className='flex h-full items-center justify-center'>
				<img src={LogoDark} alt='Loading...' className='h-24 animate-pulse' />
			</div>
		);
	}

	// Not authenticated - redirect to login with return URL
	if (!hasToken || !isAuthenticated) {
		return <Navigate to='/login' state={{ from: location }} replace />;
	}

	return <Outlet />;
};

export default Protected;
