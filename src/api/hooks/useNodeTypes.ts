import { useQuery } from '@tanstack/react-query';
import { NodeTypeService } from '../services/node-type.service';
import { queryKeys } from '../utils/query.helper';
import type { INodeTypeFilters } from '@/types/nodeType.type';

// ── List ──────────────────────────────────────────────
export const useNodeTypes = (filters?: INodeTypeFilters) =>
	useQuery({
		queryKey: queryKeys.nodeTypes.list(filters as Record<string, unknown>),
		queryFn: () => NodeTypeService.list(filters),
		staleTime: 30 * 60 * 1000,
		gcTime: 60 * 60 * 1000,
	});

// ── Categories ───────────────────────────────────────
export const useNodeCategories = () =>
	useQuery({
		queryKey: queryKeys.nodeTypes.categories(),
		queryFn: () => NodeTypeService.categories(),
		staleTime: 30 * 60 * 1000,
		gcTime: 60 * 60 * 1000,
	});

// ── Detail ───────────────────────────────────────────
export const useNodeType = (nodeType: string) =>
	useQuery({
		queryKey: queryKeys.nodeTypes.detail(nodeType),
		queryFn: () => NodeTypeService.detail(nodeType),
		enabled: !!nodeType,
		staleTime: 30 * 60 * 1000,
		gcTime: 60 * 60 * 1000,
	});
