import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { setToken, clearTokens } from '../utils/token.manager';
import { parseApiError } from '../utils/error.parser';
import { queryKeys } from '../utils/query.helper';
import type { TLoginDto, TRegisterDto, TAuthResponse } from '@/types/auth.type';

// ============ Query Hooks ============

export const useCurrentUser = (enabled: boolean = true) => {
	return useQuery({
		queryKey: queryKeys.auth.user(),
		queryFn: UserService.fetchMe,
		enabled,
		staleTime: 10 * 60 * 1000, // 10 minutes
		retry: false,
	});
};

// ============ Mutation Hooks ============

export const useLogin = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			credentials,
			rememberMe,
		}: {
			credentials: TLoginDto;
			rememberMe: boolean;
		}): Promise<TAuthResponse> => {
			const response = await AuthService.login(credentials);

			// Store tokens from nested data.token
			const { access_token, expires_in, refresh_token } = response.data.token;
			setToken(access_token, expires_in, rememberMe, refresh_token);

			return response;
		},
		onSuccess: (_data) => {
			// Invalidate user query to refetch fresh data
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
			toast.success('Welcome back!');
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			// If there are field-level errors, let the caller handle them
			if (apiError.errors) {
				throw apiError;
			}
			toast.error(apiError.message || 'Invalid email or password');
		},
	});
};

export const useRegister = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async ({
			credentials,
			rememberMe = false,
		}: {
			credentials: TRegisterDto;
			rememberMe?: boolean;
		}): Promise<TAuthResponse> => {
			const response = await AuthService.register(credentials);

			// Store tokens from nested data.token
			const { access_token, expires_in, refresh_token } = response.data.token;
			setToken(access_token, expires_in, rememberMe, refresh_token);

			return response;
		},
		onSuccess: (_data) => {
			// Invalidate user query to refetch fresh data
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
			toast.success('Account created successfully!');
		},
		onError: (error) => {
			const apiError = parseApiError(error);
			// If there are field-level errors, let the caller handle them
			if (apiError.errors) {
				throw apiError;
			}
			toast.error(apiError.message || 'Failed to create account');
		},
	});
};

export const useLogout = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: async () => {
			try {
				await AuthService.logout();
			} catch {
				// Ignore logout errors - we'll clear local state anyway
			}
		},
		onSettled: () => {
			clearTokens();
			queryClient.clear();
		},
	});
};

export const useForgotPassword = () => {
	return useMutation({
		mutationFn: AuthService.forgotPassword,
		onSuccess: () => {
			toast.success('If the email exists, a password reset link has been sent');
		},
		onError: () => {
			// Still show success message to prevent email enumeration
			toast.success('If the email exists, a password reset link has been sent');
		},
	});
};

export const useResetPassword = () => {
	return useMutation({
		mutationFn: AuthService.resetPassword,
		onSuccess: () => {
			toast.success('Password has been reset successfully!');
		},
		onError: () => {
			toast.error('Failed to reset password. The link may have expired.');
		},
	});
};

export const useUpdateProfile = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: UserService.updateProfile,
		onSuccess: (_data) => {
			queryClient.setQueryData(queryKeys.auth.user(), _data);
			toast.success('Profile updated successfully!');
		},
		onError: () => {
			toast.error('Failed to update profile');
		},
	});
};

export const useChangePassword = () => {
	return useMutation({
		mutationFn: UserService.changePassword,
		onSuccess: () => {
			toast.success('Password changed successfully!');
		},
		onError: () => {
			toast.error('Failed to change password');
		},
	});
};

export const useUploadAvatar = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: UserService.uploadAvatar,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
			toast.success('Avatar updated!');
		},
		onError: () => {
			toast.error('Failed to upload avatar');
		},
	});
};

export const useDeleteAvatar = () => {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: UserService.deleteAvatar,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: queryKeys.auth.user() });
			toast.success('Avatar removed');
		},
		onError: () => {
			toast.error('Failed to remove avatar');
		},
	});
};
