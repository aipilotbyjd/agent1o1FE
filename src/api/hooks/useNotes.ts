import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { NoteService } from '../services/note.service';
import { queryKeys } from '../utils/query.helper';
import type { INoteFilters, ICreateNoteDto, IUpdateNoteDto, TNoteResourceName } from '@/types/note.type';

// ── List ──────────────────────────────────────────────
export const useNotes = (
	workspaceId: string | null,
	resourceId?: string,
	resourceName?: TNoteResourceName,
	filters?: INoteFilters,
) =>
	useQuery({
		queryKey: queryKeys.notes.list(workspaceId || '', { resourceId, resourceName, ...filters }),
		queryFn: () => NoteService.list(workspaceId!, resourceId, resourceName, filters),
		enabled: Boolean(workspaceId) && Boolean(resourceId),
	});

// ── Detail ────────────────────────────────────────────
export const useNote = (workspaceId: string | null, noteId: string | null) =>
	useQuery({
		queryKey: queryKeys.notes.detail(workspaceId || '', noteId || ''),
		queryFn: () => NoteService.detail(workspaceId!, noteId!),
		enabled: Boolean(workspaceId) && Boolean(noteId),
	});

// ── Create ────────────────────────────────────────────
export const useCreateNote = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, payload }: { workspaceId: string; payload: ICreateNoteDto }) =>
			NoteService.create(workspaceId, payload),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.notes.all(variables.workspaceId) });
		},
		onError: () => toast.error('Failed to create note'),
	});
};

// ── Update ────────────────────────────────────────────
export const useUpdateNote = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({
			workspaceId,
			noteId,
			payload,
		}: {
			workspaceId: string;
			noteId: string;
			payload: IUpdateNoteDto;
		}) => NoteService.update(workspaceId, noteId, payload),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.notes.all(variables.workspaceId) });
		},
		onError: () => toast.error('Failed to update note'),
	});
};

// ── Delete ────────────────────────────────────────────
export const useDeleteNote = () => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ workspaceId, noteId }: { workspaceId: string; noteId: string }) =>
			NoteService.delete(workspaceId, noteId),
		onSuccess: (_, variables) => {
			qc.invalidateQueries({ queryKey: queryKeys.notes.all(variables.workspaceId) });
		},
		onError: () => toast.error('Failed to delete note'),
	});
};
