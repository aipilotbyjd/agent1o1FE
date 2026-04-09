import axiosClient from '../http/axios.config';
import { AuthEndpoints } from '../http/endpoints';
import type {
	TLoginDto,
	TRegisterDto,
	TAuthResponse,
	TForgotPasswordDto,
	TResetPasswordDto,
} from '@/types/auth.type';
import type { TMessageResponse } from '@/types/api.type';

export const AuthService = {
	login: async (payload: TLoginDto): Promise<TAuthResponse> => {
		const { data } = await axiosClient.post<TAuthResponse>(AuthEndpoints.LOGIN, payload);
		return data;
	},

	register: async (payload: TRegisterDto): Promise<TAuthResponse> => {
		const { data } = await axiosClient.post<TAuthResponse>(AuthEndpoints.REGISTER, payload);
		return data;
	},

	logout: async (): Promise<void> => {
		await axiosClient.post(AuthEndpoints.LOGOUT);
	},

	forgotPassword: async (payload: TForgotPasswordDto): Promise<TMessageResponse> => {
		const { data } = await axiosClient.post<TMessageResponse>(
			AuthEndpoints.FORGOT_PASSWORD,
			payload,
		);
		return data;
	},

	resetPassword: async (payload: TResetPasswordDto): Promise<TMessageResponse> => {
		const { data } = await axiosClient.post<TMessageResponse>(
			AuthEndpoints.RESET_PASSWORD,
			payload,
		);
		return data;
	},
};
