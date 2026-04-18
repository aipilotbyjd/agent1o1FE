import { useNavigate, useOutletContext } from 'react-router';
import { useEffect, useState, useMemo } from 'react';
import Container from '@/components/layout/Container';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
} from '@/components/layout/Subheader';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import { toast } from 'react-toastify';

import { useFetchTemplates, useUseTemplate } from '@/api';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';
import { ITemplate, TTemplateCategory, TTemplateSortBy, TSortOrder } from '@/types/template.type';

// Partials
import FiltersPartial from './_partial/Filters.partial';
import TemplateCardPartial from './_partial/TemplateCard.partial';
import TemplateDetailModalPartial from './_partial/TemplateDetailModal.partial';
import EmptyStatePartial from './_partial/EmptyState.partial';
import { LoadingStatePartial, ErrorStatePartial } from './_partial/States.partial';

export interface OutletContextType {
	headerLeft?: React.ReactNode;
	setHeaderLeft: (value: React.ReactNode) => void;
}

const TemplatesListPage = () => {
	const navigate = useNavigate();
	const workspaceId = useCurrentWorkspaceId();

	// Filter state
	const [searchQuery, setSearchQuery] = useState('');
	const [categoryFilter, setCategoryFilter] = useState<TTemplateCategory | ''>('');
	const [sortBy, setSortBy] = useState<TTemplateSortBy>('created_at');
	const [sortOrder, setSortOrder] = useState<TSortOrder>('desc');

	// Modal state
	const [selectedTemplate, setSelectedTemplate] = useState<ITemplate | null>(null);
	const [isModalOpen, setIsModalOpen] = useState(false);

	// Check if any filter is active
	const hasFilters = searchQuery || categoryFilter;

	// Build filters object for API
	const filters = useMemo(
		() => ({
			...(searchQuery && { search: searchQuery }),
			...(categoryFilter && { category: categoryFilter }),
			sort_by: sortBy,
			order: sortOrder,
		} as Record<string, unknown>),
		[searchQuery, categoryFilter, sortBy, sortOrder],
	);

	// API hooks
	const { data: templates, isLoading, isError, refetch } = useFetchTemplates(filters);
	const useTemplate = useUseTemplate();

	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	// Set breadcrumb
	useEffect(() => {
		setHeaderLeft(<span className='font-semibold'>Templates</span>);
		return () => setHeaderLeft(undefined);
	}, [setHeaderLeft]);

	const handleCardClick = (template: ITemplate) => {
		setSelectedTemplate(template);
		setIsModalOpen(true);
	};

	const handleModalClose = () => {
		setIsModalOpen(false);
		setSelectedTemplate(null);
	};

	const handleUseTemplate = async (_template: ITemplate, workflowName: string) => {
		if (!workspaceId) {
			toast.error('Select a workspace before using a template');
			return;
		}

		const result = await useTemplate.mutateAsync({
			workspaceId,
			templateId: _template.id,
			workflowName,
		});
		handleModalClose();
		if (result.workflow_id) {
			navigate(`/app/story-builder/${result.workflow_id}`);
		}
	};

	const clearAllFilters = () => {
		setSearchQuery('');
		setCategoryFilter('');
	};

	const filteredData = useMemo(() => templates || [], [templates]);

	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<FieldWrap firstSuffix={<Icon icon='Search02' />}>
						<Input
							name='search'
							variant='solid'
							placeholder='Search templates...'
							dimension='sm'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</FieldWrap>
				</SubheaderLeft>
				<SubheaderRight>
					<FiltersPartial
						categoryFilter={categoryFilter}
						setCategoryFilter={setCategoryFilter}
						sortBy={sortBy}
						setSortBy={setSortBy}
						sortOrder={sortOrder}
						setSortOrder={setSortOrder}
					/>
					{hasFilters && (
						<Button
							aria-label='Clear filters'
							variant='outline'
							color='red'
							dimension='sm'
							icon='Cancel01'
							onClick={clearAllFilters}>
							Clear
						</Button>
					)}
				</SubheaderRight>
			</Subheader>
			<Container className='flex h-full'>
				<div className='flex min-w-0 flex-1 flex-col'>
					{isLoading ? (
						<LoadingStatePartial />
					) : isError ? (
						<ErrorStatePartial onRetry={() => refetch()} />
					) : filteredData.length === 0 ? (
						<EmptyStatePartial hasFilters={!!hasFilters} onClearFilters={clearAllFilters} />
					) : (
						<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
							{filteredData.map((template: ITemplate) => (
								<TemplateCardPartial
									key={template.id}
									template={template}
									onClick={handleCardClick}
								/>
							))}
						</div>
					)}
				</div>
			</Container>

			{/* Template Detail Modal */}
			<TemplateDetailModalPartial
				template={selectedTemplate}
				isOpen={isModalOpen}
				onClose={handleModalClose}
				onUse={handleUseTemplate}
				isUsing={useTemplate.isPending}
			/>
		</>
	);
};

export default TemplatesListPage;
