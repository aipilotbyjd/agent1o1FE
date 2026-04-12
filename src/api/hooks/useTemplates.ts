import { useQuery, useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import { TemplateService } from '../services/template.service';
import { queryKeys } from '../utils/query.helper';
import type { ITemplateFilters } from '@/types/template.type';

// ── List ──────────────────────────────────────────────
export const useFetchTemplates = (filters?: ITemplateFilters) =>
	useQuery({
		queryKey: queryKeys.templates.list(filters as Record<string, unknown>),
		queryFn: () => TemplateService.list(filters),
	});

// ── Featured ──────────────────────────────────────────
export const useFetchFeaturedTemplates = () =>
	useQuery({
		queryKey: queryKeys.templates.featured(),
		queryFn: () => TemplateService.featured(),
	});

// ── Categories ────────────────────────────────────────
export const useFetchTemplateCategories = () =>
	useQuery({
		queryKey: queryKeys.templates.categories(),
		queryFn: () => TemplateService.categories(),
	});

// ── Detail ────────────────────────────────────────────
export const useFetchTemplate = (id: string | undefined) =>
	useQuery({
		queryKey: queryKeys.templates.detail(id!),
		queryFn: () => TemplateService.detail(id!),
		enabled: !!id,
	});

// ── Track View ────────────────────────────────────────
export const useTrackTemplateView = () =>
	useMutation({
		mutationFn: (id: string) => TemplateService.trackView(id),
	});

// ── Use Template ──────────────────────────────────────
export const useUseTemplate = () =>
	useMutation({
		mutationFn: ({
			workspaceId,
			templateId,
			workflowName,
		}: {
			workspaceId: string;
			templateId: string;
			workflowName?: string;
		}) => TemplateService.use(workspaceId, templateId, workflowName),
		onSuccess: () => toast.success('Workflow created from template'),
		onError: () => toast.error('Failed to create workflow from template'),
	});
