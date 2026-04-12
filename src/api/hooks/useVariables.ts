import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { VariableService } from '../services/variable.service';
import { queryKeys } from '../utils/query.helper';
import type { IVariableFilters, ICreateVariableDto, IUpdateVariableDto } from '@/types/variable.type';

// ── List ──────────────────────────────────────────────
export const useFetchVariables = (
	workspaceId: string | undefined,
	filters?: IVariableFilters,
) =>
	useQuery({
		queryKey: queryKeys.variables.list(workspaceId, filters as Record<string, unknown>),
		queryFn: () => VariableService.list(workspaceId!, filters),
		enabled: !!workspaceId,
	});

// ── Detail ────────────────────────────────────────────
export const useFetchVariable = (workspaceId: string | undefined, id: string | undefined) =>
	useQuery({
		queryKey: queryKeys.variables.detail(workspaceId, id),
		queryFn: () => VariableService.detail(workspaceId!, id!),
		enabled: !!workspaceId && !!id,
	});

// ── Resolve ───────────────────────────────────────────
export const useResolveVariable = (
	workspaceId: string | undefined,
	name: string | undefined,
) =>
	useQuery({
		queryKey: queryKeys.variables.resolve(workspaceId, name),
		queryFn: () => VariableService.resolve(workspaceId!, name!),
		enabled: !!workspaceId && !!name,
	});

// ── Create ────────────────────────────────────────────
export const useCreateVariable = (workspaceId: string | undefined) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (dto: ICreateVariableDto) => VariableService.create(workspaceId!, dto),
		onSuccess: () => {
			toast.success('Variable created');
			if (workspaceId) qc.invalidateQueries({ queryKey: queryKeys.variables.all(workspaceId) });
		},
		onError: () => toast.error('Failed to create variable'),
	});
};

// ── Update ────────────────────────────────────────────
export const useUpdateVariable = (workspaceId: string | undefined) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: ({ id, dto }: { id: string; dto: IUpdateVariableDto }) =>
			VariableService.update(workspaceId!, id, dto),
		onSuccess: () => {
			toast.success('Variable updated');
			if (workspaceId) qc.invalidateQueries({ queryKey: queryKeys.variables.all(workspaceId) });
		},
		onError: () => toast.error('Failed to update variable'),
	});
};

// ── Delete ────────────────────────────────────────────
export const useDeleteVariable = (workspaceId: string | undefined) => {
	const qc = useQueryClient();
	return useMutation({
		mutationFn: (id: string) => VariableService.delete(workspaceId!, id),
		onSuccess: () => {
			toast.success('Variable deleted');
			if (workspaceId) qc.invalidateQueries({ queryKey: queryKeys.variables.all(workspaceId) });
		},
		onError: () => toast.error('Failed to delete variable'),
	});
};
