import { createContext, useContext, useMemo, useCallback } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useCurrentUser, useLogin, useLogout, useRegister } from '@/api/hooks/useAuth';
import { hasValidToken } from '@/api/utils/token.manager';
import type { TUser, TLoginDto, TRegisterDto } from '@/types/auth.type';

export interface IAuthContextProps {
	isLoading: boolean;
	isAuthenticated: boolean;
	userData: TUser | null;
	onLogin: (email: string, password: string, rememberMe: boolean) => Promise<void>;
	onRegister: (data: TRegisterDto, rememberMe?: boolean) => Promise<void>;
	onLogout: (isRedirect?: boolean) => Promise<void>;
}

const AuthContext = createContext<IAuthContextProps>({} as IAuthContextProps);

export const AuthProvider = () => {
	const navigate = useNavigate();

	// Check if user has valid token
	const isAuthenticated = hasValidToken();

	// Fetch current user if authenticated
	const {
		data: userData,
		isLoading: isUserLoading,
	} = useCurrentUser(isAuthenticated);

	// Mutations
	const loginMutation = useLogin();
	const logoutMutation = useLogout();
	const registerMutation = useRegister();

	// Login handler
	const onLogin = useCallback(
		async (email: string, password: string, rememberMe: boolean) => {
			const credentials: TLoginDto = { email, password };
			await loginMutation.mutateAsync({ credentials, rememberMe });
			navigate('/customer');
		},
		[loginMutation, navigate],
	);

	// Register handler
	const onRegister = useCallback(
		async (data: TRegisterDto, rememberMe: boolean = false) => {
			await registerMutation.mutateAsync({ credentials: data, rememberMe });
			navigate('/customer');
		},
		[registerMutation, navigate],
	);

	// Logout handler
	const onLogout = useCallback(
		async (isRedirect: boolean = true) => {
			await logoutMutation.mutateAsync();
			// clearTokens is called by useLogout's onSettled
			if (isRedirect) {
				navigate('/login', { replace: true });
			}
		},
		[logoutMutation, navigate],
	);

	// Combined loading state
	const isLoading =
		isUserLoading ||
		loginMutation.isPending ||
		logoutMutation.isPending ||
		registerMutation.isPending;

	const value: IAuthContextProps = useMemo(
		() => ({
			isLoading,
			isAuthenticated: isAuthenticated && !!userData,
			userData: userData ?? null,
			onLogin,
			onRegister,
			onLogout,
		}),
		[isLoading, isAuthenticated, userData, onLogin, onRegister, onLogout],
	);

	return (
		<AuthContext.Provider value={value}>
			<Outlet />
		</AuthContext.Provider>
	);
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
	return useContext(AuthContext);
};
