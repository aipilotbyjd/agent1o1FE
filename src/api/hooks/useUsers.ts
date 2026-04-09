import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserService } from '../services/user.service';
import { queryKeys } from '../utils/query.helper';
import type { TUpdateProfileDto, TChangePasswordDto } from '@/types/auth.type';

export const useFetchCurrentUser = (enabled: boolean = true) =>
	useQuery({
		queryKey: queryKeys.auth.user(),
		queryFn: UserService.fetchMe,
		enabled,
		staleTime: 10 * 60 * 1000,
		retry: false,
	});

export const useUpdateUserProfile = () => {
	const queryClient = useQueryClient();
	return useMutation({
		mutationFn: (data: TUpdateProfileDto) => UserService.updateProfile(data),
		onSuccess: (data) => {
			queryClient.setQueryData(queryKeys.auth.user(), data);
		},
	});
};

export const useChangeUserPassword = () => {
	return useMutation({
		mutationFn: (data: TChangePasswordDto) => UserService.changePassword(data),
	});
};
