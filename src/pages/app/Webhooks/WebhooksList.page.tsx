import Container from '@/components/layout/Container';
import { useOutletContext } from 'react-router';
import { OutletContextType } from './_layouts/Webhooks.layout';
import { useEffect, useState, useMemo, useCallback } from 'react';
import Breadcrumb from '@/components/layout/Breadcrumb';
import pages from '@/Routes/pages';
import Subheader, {
	SubheaderLeft,
	SubheaderRight,
	SubheaderSeparator,
} from '@/components/layout/Subheader';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import Card, { CardBody } from '@/components/ui/Card';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '@/components/ui/Dropdown';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';
import {
	useFetchWebhooks,
	useDeleteWebhook,
	useActivateWebhook,
	useDeactivateWebhook,
	useCreateWebhook,
	useUpdateWebhook,
	useTestWebhook,
} from '@/api/hooks/useWebhooks';
import { useFetchWorkflows } from '@/api/hooks/useWorkflows';
import type { TWebhook } from '@/types/webhook.type';
import { toast } from 'react-toastify';

import StatsCardsPartial from './_partial/StatsCards.partial';
import EmptyStatePartial from './_partial/EmptyState.partial';
import WebhookModalPartial from './_partial/WebhookModal.partial';
import { LoadingStatePartial, ErrorStatePartial } from './_partial/States.partial';

const WebhooksListPage = () => {
	const workspaceId = useCurrentWorkspaceId();

	// ─── State ────────────────────────────────────────────
	const [searchQuery, setSearchQuery] = useState('');
	const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [editingWebhook, setEditingWebhook] = useState<TWebhook | null>(null);

	// ─── Breadcrumb ───────────────────────────────────────
	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	useEffect(() => {
		setHeaderLeft(<Breadcrumb list={[{ ...pages.app.appMain.subPages.webhooks }]} />);
		return () => setHeaderLeft(undefined);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// ─── API Hooks ────────────────────────────────────────
	const {
		data: webhooksData,
		isLoading,
		isError,
		refetch,
	} = useFetchWebhooks(workspaceId || '');

	const { data: workflowsData } = useFetchWorkflows(workspaceId || '', {});

	const deleteWebhook = useDeleteWebhook(workspaceId || '');
	const activateWebhook = useActivateWebhook(workspaceId || '');
	const deactivateWebhook = useDeactivateWebhook(workspaceId || '');
	const createWebhook = useCreateWebhook(workspaceId || '');
	const updateWebhook = useUpdateWebhook(workspaceId || '');
	const testWebhook = useTestWebhook(workspaceId || '');

	// ─── Derived Data ─────────────────────────────────────
	const webhooks: TWebhook[] = useMemo(() => {
		if (!webhooksData) return [];
		if (Array.isArray(webhooksData)) return webhooksData;
		if ('data' in webhooksData && Array.isArray(webhooksData.data)) return webhooksData.data;
		return [];
	}, [webhooksData]);

	const workflows = useMemo(() => {
		if (!workflowsData) return [];
		if (Array.isArray(workflowsData)) return workflowsData;
		if ('data' in workflowsData && Array.isArray(workflowsData.data))
			return workflowsData.data;
		return [];
	}, [workflowsData]);

	const filteredWebhooks = useMemo(() => {
		let result = [...webhooks];

		if (searchQuery) {
			const query = searchQuery.toLowerCase();
			result = result.filter(
				(w) =>
					w.name.toLowerCase().includes(query) ||
					w.path.toLowerCase().includes(query) ||
					w.workflow_name?.toLowerCase().includes(query),
			);
		}

		if (statusFilter) {
			result = result.filter((w) =>
				statusFilter === 'active' ? w.is_active : !w.is_active,
			);
		}

		return result;
	}, [webhooks, searchQuery, statusFilter]);

	const hasFilters = searchQuery || statusFilter;

	// ─── Handlers ─────────────────────────────────────────
	const handleOpenCreateModal = () => {
		setEditingWebhook(null);
		setIsModalOpen(true);
	};

	const handleOpenEditModal = (webhook: TWebhook) => {
		setEditingWebhook(webhook);
		setIsModalOpen(true);
	};

	const handleModalSubmit = async (values: Partial<TWebhook>) => {
		if (editingWebhook) {
			await updateWebhook.mutateAsync({ id: editingWebhook.id, data: values });
			toast.success('Webhook updated successfully');
		} else {
			await createWebhook.mutateAsync(values);
			toast.success('Webhook created successfully');
		}
		setIsModalOpen(false);
		setEditingWebhook(null);
	};

	const handleToggleStatus = useCallback(
		(id: string, currentStatus: boolean) => {
			if (currentStatus) {
				deactivateWebhook.mutate(id);
			} else {
				activateWebhook.mutate(id);
			}
		},
		[activateWebhook, deactivateWebhook],
	);

	const handleDelete = (id: string, name: string) => {
		if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
			deleteWebhook.mutate(id);
			toast.success('Webhook deleted');
		}
	};

	const handleCopyUrl = (url: string) => {
		navigator.clipboard.writeText(url);
		toast.success('Webhook URL copied to clipboard');
	};

	const handleTest = async (id: string) => {
		try {
			await testWebhook.mutateAsync({ id, data: { test: true } });
			toast.success('Test request sent successfully');
		} catch {
			toast.error('Failed to send test request');
		}
	};

	const clearFilters = () => {
		setSearchQuery('');
		setStatusFilter('');
	};

	// ─── Render ───────────────────────────────────────────
	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<FieldWrap firstSuffix={<Icon icon='Search02' />}>
						<Input
							name='search'
							variant='solid'
							placeholder='Search webhooks...'
							dimension='sm'
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
						/>
					</FieldWrap>
				</SubheaderLeft>
				<SubheaderRight>
					<Dropdown>
						<DropdownToggle>
							<Button
								variant='outline'
								dimension='sm'
								icon='Filter'
								rightIcon='ChevronDown'>
								{statusFilter
									? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
									: 'All Status'}
							</Button>
						</DropdownToggle>
						<DropdownMenu placement='bottom-end'>
							<DropdownItem onClick={() => setStatusFilter('')}>
								All Status
							</DropdownItem>
							<DropdownItem onClick={() => setStatusFilter('active')}>
								Active
							</DropdownItem>
							<DropdownItem onClick={() => setStatusFilter('inactive')}>
								Inactive
							</DropdownItem>
						</DropdownMenu>
					</Dropdown>
					{hasFilters && (
						<Button
							aria-label='Clear filters'
							variant='outline'
							color='red'
							dimension='sm'
							icon='Cancel01'
							onClick={clearFilters}>
							Clear
						</Button>
					)}
					<SubheaderSeparator />
					<Button
						aria-label='New Webhook'
						variant='solid'
						icon='PlusSignCircle'
						onClick={handleOpenCreateModal}>
						New Webhook
					</Button>
				</SubheaderRight>
			</Subheader>

			<Container className='flex h-full'>
				<div className='flex min-w-0 flex-1 flex-col gap-4'>
					{/* Stats Cards */}
					{!isLoading && !isError && <StatsCardsPartial webhooks={filteredWebhooks} />}

					{/* Main Content */}
					{isLoading ? (
						<LoadingStatePartial />
					) : isError ? (
						<ErrorStatePartial onRetry={() => refetch()} />
					) : filteredWebhooks.length === 0 ? (
						<EmptyStatePartial
							hasFilters={!!hasFilters}
							onClearFilters={clearFilters}
							onCreate={handleOpenCreateModal}
						/>
					) : (
						<div className='grid grid-cols-1 gap-4'>
							{filteredWebhooks.map((webhook) => (
								<Card key={webhook.id}>
									<CardBody>
										<div className='flex items-start justify-between'>
											<div className='flex-1'>
												<div className='flex items-center gap-3'>
													<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
														<Icon
															icon='Webhook'
															color='blue'
															size='text-xl'
														/>
													</div>
													<div>
														<div className='font-semibold text-zinc-900 dark:text-white'>
															{webhook.name}
														</div>
														<div className='flex items-center gap-2 text-sm text-zinc-500'>
															<Badge
																variant='soft'
																color='blue'>
																{webhook.method}
															</Badge>
															<span>→</span>
															<span>{webhook.workflow_name || 'Workflow'}</span>
														</div>
													</div>
												</div>

												<div className='mt-3 flex items-center gap-2'>
													<Badge
														variant='outline'
														color={webhook.is_active ? 'emerald' : 'zinc'}>
														{webhook.is_active ? 'Active' : 'Inactive'}
													</Badge>
													<div className='text-xs text-zinc-500'>
														{webhook.calls_count} calls
													</div>
													{webhook.last_called_at && (
														<div className='text-xs text-zinc-500'>
															Last called{' '}
															{new Date(
																webhook.last_called_at * 1000,
															).toLocaleDateString()}
														</div>
													)}
												</div>

												<div className='mt-3 flex items-center gap-2 rounded-lg bg-zinc-100 p-2 dark:bg-zinc-800'>
													<code className='flex-1 text-sm font-mono text-zinc-700 dark:text-zinc-300'>
														{webhook.url}
													</code>
													<Button
														variant='outline'
														dimension='sm'
														icon='Copy01'
														onClick={() => handleCopyUrl(webhook.url)}>
														Copy
													</Button>
												</div>
											</div>

											<Dropdown>
												<DropdownToggle>
													<Button
														variant='outline'
														dimension='sm'
														icon='MoreHorizontal'
														aria-label='Actions'
													/>
												</DropdownToggle>
												<DropdownMenu placement='bottom-end'>
													<DropdownItem
														icon='PencilEdit02'
														onClick={() =>
															handleOpenEditModal(webhook)
														}>
														Edit
													</DropdownItem>
													<DropdownItem
														icon='Zap'
														onClick={() => handleTest(webhook.id)}>
														Test Webhook
													</DropdownItem>
													<DropdownItem
														icon={
															webhook.is_active
																? 'PauseCircle'
																: 'PlayCircle'
														}
														onClick={() =>
															handleToggleStatus(
																webhook.id,
																webhook.is_active,
															)
														}>
														{webhook.is_active
															? 'Deactivate'
															: 'Activate'}
													</DropdownItem>
													<DropdownItem
														icon='Delete02'
														onClick={() =>
															handleDelete(webhook.id, webhook.name)
														}>
														Delete
													</DropdownItem>
												</DropdownMenu>
											</Dropdown>
										</div>
									</CardBody>
								</Card>
							))}
						</div>
					)}
				</div>
			</Container>

			{/* Webhook Modal */}
			<WebhookModalPartial
				isOpen={isModalOpen}
				onClose={() => {
					setIsModalOpen(false);
					setEditingWebhook(null);
				}}
				onSubmit={handleModalSubmit}
				isLoading={createWebhook.isPending || updateWebhook.isPending}
				webhook={editingWebhook}
				workflows={workflows.map((w) => ({ id: w.id, name: w.name }))}
			/>
		</>
	);
};

export default WebhooksListPage;
