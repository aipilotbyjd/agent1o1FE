import axiosClient from '../http/axios.config';
import { UserEndpoints } from '../http/endpoints';
import type { TUser, TUpdateProfileDto, TChangePasswordDto, TAvatarResponse } from '@/types/auth.type';
import type { TApiResponse, TMessageResponse } from '@/types/api.type';

export const UserService = {
	fetchMe: async (): Promise<TUser> => {
		const { data } = await axiosClient.get<TApiResponse<TUser>>(UserEndpoints.ME);
		return data.data;
	},

	updateProfile: async (payload: TUpdateProfileDto): Promise<TUser> => {
		const { data } = await axiosClient.put<TApiResponse<TUser>>(UserEndpoints.UPDATE, payload);
		return data.data;
	},

	changePassword: async (payload: TChangePasswordDto): Promise<TMessageResponse> => {
		const { data } = await axiosClient.put<TMessageResponse>(
			UserEndpoints.CHANGE_PASSWORD,
			payload,
		);
		return data;
	},

	uploadAvatar: async (file: File): Promise<string> => {
		// Validate file type
		if (!file.type.startsWith('image/')) {
			throw new Error('Avatar must be an image file');
		}
		// Validate file size (5MB limit)
		if (file.size > 5 * 1024 * 1024) {
			throw new Error('Avatar must be smaller than 5MB');
		}

		const formData = new FormData();
		formData.append('avatar', file);
		const { data } = await axiosClient.post<TAvatarResponse>(
			UserEndpoints.UPLOAD_AVATAR,
			formData,
			{ headers: { 'Content-Type': 'multipart/form-data' } },
		);
		return data.data.avatar_url;
	},

	deleteAvatar: async (): Promise<void> => {
		await axiosClient.delete(UserEndpoints.DELETE_AVATAR);
	},
};
