import axiosClient from '../http/axios.config';
import { NoteEndpoints } from '../http/endpoints';
import type { TApiResponse, TPaginatedResponse } from '@/types/api.type';
import type {
	INote,
	INoteFilters,
	ICreateNoteDto,
	IUpdateNoteDto,
	TNoteResourceName,
} from '@/types/note.type';

export const NoteService = {
	list: async (
		workspaceId: string,
		resourceId?: string,
		resourceName?: TNoteResourceName,
		filters?: INoteFilters,
	): Promise<TPaginatedResponse<INote>> => {
		const params: Record<string, unknown> = { ...filters };
		if (resourceId) params.resource_id = resourceId;
		if (resourceName) params.resource_name = resourceName;

		const { data } = await axiosClient.get<TPaginatedResponse<INote>>(
			NoteEndpoints.LIST(workspaceId),
			{ params },
		);
		return data;
	},

	detail: async (workspaceId: string, noteId: string): Promise<INote> => {
		const { data } = await axiosClient.get<TApiResponse<INote>>(
			NoteEndpoints.DETAIL(workspaceId, noteId),
		);
		return data.data;
	},

	create: async (workspaceId: string, payload: ICreateNoteDto): Promise<INote> => {
		const { data } = await axiosClient.post<TApiResponse<INote>>(
			NoteEndpoints.CREATE(workspaceId),
			payload,
		);
		return data.data;
	},

	update: async (workspaceId: string, noteId: string, payload: IUpdateNoteDto): Promise<INote> => {
		const { data } = await axiosClient.put<TApiResponse<INote>>(
			NoteEndpoints.UPDATE(workspaceId, noteId),
			payload,
		);
		return data.data;
	},

	delete: async (workspaceId: string, noteId: string): Promise<void> => {
		await axiosClient.delete(NoteEndpoints.DELETE(workspaceId, noteId));
	},
};
