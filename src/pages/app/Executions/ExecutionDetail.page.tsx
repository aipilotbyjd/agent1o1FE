import { useEffect, useMemo } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import Container from '@/components/layout/Container';
import Subheader, { SubheaderLeft, SubheaderRight } from '@/components/layout/Subheader';
import Button from '@/components/ui/Button';
import Card, { CardBody, CardHeader, CardHeaderChild, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/icon/Icon';
import {
	useCancelExecution,
	useFetchExecutionById,
	useFetchExecutionLogs,
	useRetryExecution,
} from '@/api';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';
import { TExecutionLog, TExecutionNode, TExecutionStatus } from '@/types/execution.type';
import { STATUS_COLORS, formatDuration } from './_helper/helper';

export interface OutletContextType {
	headerLeft?: React.ReactNode;
	setHeaderLeft: (value: React.ReactNode) => void;
}

const LOG_COLORS: Record<TExecutionLog['level'], 'blue' | 'amber' | 'red' | 'zinc'> = {
	info: 'blue',
	warning: 'amber',
	error: 'red',
	debug: 'zinc',
};

const NODE_ICONS: Record<TExecutionStatus, string> = {
	running: 'Loading03',
	completed: 'CheckmarkCircle02',
	failed: 'AlertCircle',
};

const stringifyValue = (value: unknown) => {
	try {
		return JSON.stringify(value, null, 2);
	} catch {
		return String(value);
	}
};

const downloadJson = (filename: string, payload: unknown) => {
	const blob = new Blob([stringifyValue(payload)], { type: 'application/json' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
};

const ExecutionDetailPage = () => {
	const navigate = useNavigate();
	const { executionId = '' } = useParams();
	const workspaceId = useCurrentWorkspaceId() || '';
	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	const {
		data: execution,
		isLoading: isExecutionLoading,
		isError: isExecutionError,
		refetch: refetchExecution,
	} = useFetchExecutionById(workspaceId, executionId);
	const {
		data: logs = [],
		isLoading: areLogsLoading,
		isError: areLogsError,
		refetch: refetchLogs,
	} = useFetchExecutionLogs(workspaceId, executionId);

	const cancelExecution = useCancelExecution(workspaceId);
	const retryExecution = useRetryExecution(workspaceId);

	const nodes = useMemo(
		() =>
			Object.entries(execution?.nodes || {}).map(([nodeId, node]) => ({
				id: nodeId,
				...(node as TExecutionNode),
			})),
		[execution],
	);

	const status = execution?.status;
	const failedNodeCount = nodes.filter((node) => node.status === 'failed').length;
	const completedNodeCount = nodes.filter((node) => node.status === 'completed').length;
	const totalDuration = nodes.reduce((sum, node) => sum + (node.duration_ms || 0), 0);

	useEffect(() => {
		setHeaderLeft(
			<div className='flex items-center gap-2'>
				<span className='font-semibold'>Execution</span>
				<span className='font-mono text-sm text-zinc-500'>{executionId.slice(0, 8)}</span>
			</div>,
		);
		return () => setHeaderLeft(undefined);
	}, [executionId, setHeaderLeft]);

	const handleRefresh = () => {
		refetchExecution();
		refetchLogs();
	};

	return (
		<>
			<Subheader>
				<SubheaderLeft>
					<Button
						variant='outline'
						dimension='sm'
						icon='ArrowLeft02'
						onClick={() => navigate('/app/executions')}>
						Executions
					</Button>
				</SubheaderLeft>
				<SubheaderRight>
					<Button
						variant='outline'
						dimension='sm'
						icon='RotateClockwise'
						onClick={handleRefresh}>
						Refresh
					</Button>
					<Button
						variant='outline'
						dimension='sm'
						icon='Download04'
						isDisable={!execution}
						onClick={() =>
							downloadJson(`execution-${executionId}.json`, {
								execution,
								logs,
							})
						}>
						Export
					</Button>
					{status === 'running' && (
						<Button
							variant='outline'
							color='red'
							dimension='sm'
							icon='Cancel01'
							isLoading={cancelExecution.isPending}
							onClick={() => cancelExecution.mutate(executionId)}>
							Cancel
						</Button>
					)}
					{status === 'failed' && (
						<Button
							variant='solid'
							dimension='sm'
							icon='RotateClockwise'
							isLoading={retryExecution.isPending}
							onClick={() => retryExecution.mutate(executionId)}>
							Retry
						</Button>
					)}
				</SubheaderRight>
			</Subheader>

			<Container className='flex h-full'>
				<div className='flex min-w-0 flex-1 flex-col gap-4'>
					{isExecutionLoading ? (
						<div className='flex min-h-[50vh] items-center justify-center'>
							<Icon icon='Loading03' size='text-4xl' className='animate-spin' />
						</div>
					) : isExecutionError || !execution ? (
						<div className='flex min-h-[50vh] items-center justify-center'>
							<div className='text-center'>
								<Icon icon='AlertCircle' size='text-5xl' className='mx-auto text-red-500' />
								<p className='mt-3 font-semibold text-zinc-900 dark:text-white'>
									Execution could not be loaded
								</p>
								<Button className='mt-4' variant='solid' onClick={() => refetchExecution()}>
									Try Again
								</Button>
							</div>
						</div>
					) : (
						<>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
								<Card>
									<CardBody>
										<p className='text-sm text-zinc-500'>Status</p>
										<div className='mt-2'>
											<Badge variant='soft' color={STATUS_COLORS[execution.status]}>
												{execution.status === 'running' && (
													<Icon icon='Loading03' className='me-1 animate-spin' />
												)}
												{execution.status}
											</Badge>
										</div>
									</CardBody>
								</Card>
								<Card>
									<CardBody>
										<p className='text-sm text-zinc-500'>Nodes</p>
										<p className='mt-2 text-2xl font-semibold text-zinc-900 dark:text-white'>
											{nodes.length}
										</p>
									</CardBody>
								</Card>
								<Card>
									<CardBody>
										<p className='text-sm text-zinc-500'>Completed</p>
										<p className='mt-2 text-2xl font-semibold text-emerald-600'>
											{completedNodeCount}
										</p>
									</CardBody>
								</Card>
								<Card>
									<CardBody>
										<p className='text-sm text-zinc-500'>Duration</p>
										<p className='mt-2 text-2xl font-semibold text-zinc-900 dark:text-white'>
											{formatDuration(totalDuration)}
										</p>
									</CardBody>
								</Card>
							</div>

							{failedNodeCount > 0 && (
								<div className='rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/20 dark:text-red-300'>
									{failedNodeCount} node{failedNodeCount !== 1 ? 's' : ''} failed in this run.
								</div>
							)}

							<div className='grid grid-cols-1 gap-4 xl:grid-cols-12'>
								<Card className='xl:col-span-7'>
									<CardHeader>
										<CardHeaderChild>
											<CardTitle iconProps={{ icon: 'WorkflowCircle01', color: 'blue' }}>
												Node Results
											</CardTitle>
										</CardHeaderChild>
									</CardHeader>
									<CardBody>
										{nodes.length === 0 ? (
											<p className='py-8 text-center text-sm text-zinc-500'>No node results recorded.</p>
										) : (
											<div className='space-y-3'>
												{nodes.map((node) => (
													<div
														key={node.id}
														className='rounded-lg border border-zinc-200 p-4 dark:border-zinc-800'>
														<div className='flex items-start justify-between gap-4'>
															<div className='flex min-w-0 items-center gap-3'>
																<div className='flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800'>
																	<Icon
																		icon={NODE_ICONS[node.status]}
																		className={node.status === 'running' ? 'animate-spin' : undefined}
																	/>
																</div>
																<div className='min-w-0'>
																	<p className='truncate font-medium text-zinc-900 dark:text-white'>
																		{node.id}
																	</p>
																	<p className='text-xs text-zinc-500'>
																		{formatDuration(node.duration_ms)}
																	</p>
																</div>
															</div>
															<Badge variant='soft' color={STATUS_COLORS[node.status]}>
																{node.status}
															</Badge>
														</div>
														<pre className='mt-3 max-h-72 overflow-auto rounded-lg bg-zinc-950 p-3 text-xs text-zinc-100'>
															{stringifyValue(node.output)}
														</pre>
													</div>
												))}
											</div>
										)}
									</CardBody>
								</Card>

								<Card className='xl:col-span-5'>
									<CardHeader>
										<CardHeaderChild>
											<CardTitle iconProps={{ icon: 'ListView', color: 'emerald' }}>
												Logs
											</CardTitle>
										</CardHeaderChild>
										<CardHeaderChild>
											<Badge variant='soft' color='zinc'>
												{logs.length}
											</Badge>
										</CardHeaderChild>
									</CardHeader>
									<CardBody>
										{areLogsLoading ? (
											<div className='flex justify-center py-8'>
												<Icon icon='Loading03' className='animate-spin' />
											</div>
										) : areLogsError ? (
											<div className='py-8 text-center'>
												<p className='text-sm text-zinc-500'>Logs could not be loaded.</p>
												<Button className='mt-3' variant='outline' dimension='sm' onClick={() => refetchLogs()}>
													Try Again
												</Button>
											</div>
										) : logs.length === 0 ? (
											<p className='py-8 text-center text-sm text-zinc-500'>No logs recorded.</p>
										) : (
											<div className='space-y-3'>
												{logs.map((log, index) => (
													<div
														key={`${log.timestamp}-${index}`}
														className='rounded-lg border border-zinc-200 p-3 dark:border-zinc-800'>
														<div className='mb-2 flex items-center justify-between gap-2'>
															<Badge variant='soft' color={LOG_COLORS[log.level]}>
																{log.level}
															</Badge>
															<span className='text-xs text-zinc-500'>
																{new Date(log.timestamp).toLocaleString()}
															</span>
														</div>
														<p className='text-sm text-zinc-900 dark:text-white'>{log.message}</p>
														{log.node_id && (
															<p className='mt-2 font-mono text-xs text-zinc-500'>{log.node_id}</p>
														)}
													</div>
												))}
											</div>
										)}
									</CardBody>
								</Card>
							</div>
						</>
					)}
				</div>
			</Container>
		</>
	);
};

export default ExecutionDetailPage;
