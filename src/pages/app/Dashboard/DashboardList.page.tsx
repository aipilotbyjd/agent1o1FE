import { useOutletContext } from 'react-router';
import { useEffect } from 'react';
import Icon from '@/components/icon/Icon';
import { useFetchDashboard } from '@/api';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';

export interface OutletContextType {
	headerLeft?: React.ReactNode;
	setHeaderLeft: (value: React.ReactNode) => void;
}

const DashboardListPage = () => {
	// Using the active workspace ID from context
	const workspaceId = useCurrentWorkspaceId() || '';

	const { setHeaderLeft } = useOutletContext<OutletContextType>();

	// Set breadcrumb
	useEffect(() => {
		setHeaderLeft(<span className='font-semibold'>Dashboard</span>);
		return () => setHeaderLeft(undefined);
	}, [setHeaderLeft]);

	// API hooks
	const { data: dashboardData, isLoading, isError, refetch } = useFetchDashboard(workspaceId);

	return (
		<div className='mx-auto w-full bg-white px-2 pt-4 pb-2 dark:bg-zinc-950'>
			{isLoading ? (
				<div className='flex min-h-[60vh] items-center justify-center'>
					<Icon icon='Loading03' size='text-4xl' className='animate-spin' />
				</div>
			) : isError ? (
				<div className='flex min-h-[60vh] items-center justify-center'>
					<div className='text-center'>
						<Icon icon='AlertCircle' size='text-4xl' className='mx-auto mb-4 text-red-500' />
						<p className='text-zinc-600 dark:text-zinc-400'>Failed to load dashboard</p>
						<button
							onClick={() => refetch()}
							className='mt-4 text-sm text-blue-500 hover:underline'>
							Retry
						</button>
					</div>
				</div>
			) : (
				<div className='space-y-6'>
					{/* Welcome Section */}
					<div className='rounded-xl bg-zinc-50 p-6 dark:bg-zinc-800/50'>
						<h1 className='text-2xl font-bold text-zinc-900 dark:text-white'>
							Welcome back!
						</h1>
						<p className='mt-2 text-zinc-600 dark:text-zinc-400'>
							Here's what's happening in your workspace today.
						</p>
					</div>

					{/* Stats Grid */}
					<div className='grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4'>
						<div className='rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
							<div className='flex items-center gap-3'>
								<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
									<Icon icon='Workflow' className='text-blue-600 dark:text-blue-400' />
								</div>
								<div>
									<p className='text-sm text-zinc-500 dark:text-zinc-400'>Workflows</p>
									<p className='text-2xl font-bold text-zinc-900 dark:text-white'>
										{dashboardData?.summary.total_workflows || 0}
									</p>
								</div>
							</div>
						</div>

						<div className='rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
							<div className='flex items-center gap-3'>
								<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30'>
									<Icon icon='Activity01' className='text-emerald-600 dark:text-emerald-400' />
								</div>
								<div>
									<p className='text-sm text-zinc-500 dark:text-zinc-400'>Executions Today</p>
									<p className='text-2xl font-bold text-zinc-900 dark:text-white'>
										{dashboardData?.summary.total_executions_today || 0}
									</p>
								</div>
							</div>
						</div>

						<div className='rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
							<div className='flex items-center gap-3'>
								<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
									<Icon icon='Variable' className='text-violet-600 dark:text-violet-400' />
								</div>
								<div>
									<p className='text-sm text-zinc-500 dark:text-zinc-400'>Success Rate</p>
									<p className='text-2xl font-bold text-zinc-900 dark:text-white'>
										{dashboardData?.summary.success_rate ? `${Math.round(dashboardData.summary.success_rate)}%` : '0%'}
									</p>
								</div>
							</div>
						</div>

						<div className='rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
							<div className='flex items-center gap-3'>
								<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30'>
									<Icon icon='Key01' className='text-amber-600 dark:text-amber-400' />
								</div>
								<div>
									<p className='text-sm text-zinc-500 dark:text-zinc-400'>Credentials</p>
									<p className='text-2xl font-bold text-zinc-900 dark:text-white'>
										{dashboardData?.summary.total_credentials || 0}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Recent Activity */}
					<div className='rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900'>
						<h2 className='mb-4 text-lg font-semibold text-zinc-900 dark:text-white'>
							Recent Activity
						</h2>
						{dashboardData?.recent_executions && dashboardData.recent_executions.length > 0 ? (
							<div className='space-y-3'>
								{dashboardData.recent_executions.slice(0, 5).map((execution) => (
									<div
										key={execution.id}
										className='flex items-center justify-between rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50'>
										<div className='flex items-center gap-3'>
											<div
												className={`flex h-8 w-8 items-center justify-center rounded-full ${
													execution.status === 'completed'
														? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'
														: execution.status === 'failed'
															? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
															: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
												}`}>
												<Icon
													icon={
														execution.status === 'completed'
															? 'CheckmarkCircle02'
															: execution.status === 'failed'
																? 'Cancel01'
																: 'Loading03'
													}
												/>
											</div>
											<div>
												<p className='text-sm font-medium text-zinc-900 dark:text-white'>
													{execution.workflow_name}
												</p>
												<p className='text-xs text-zinc-500 dark:text-zinc-400'>
													{execution.started_at ? new Date(execution.started_at * 1000).toLocaleString() : 'N/A'}
												</p>
											</div>
										</div>
										<span
											className={`text-xs font-medium ${
												execution.status === 'completed'
													? 'text-emerald-600 dark:text-emerald-400'
													: execution.status === 'failed'
														? 'text-red-600 dark:text-red-400'
														: 'text-blue-600 dark:text-blue-400'
											}`}>
											{execution.status}
										</span>
									</div>
								))}
							</div>
						) : (
							<p className='text-sm text-zinc-500 dark:text-zinc-400'>No recent activity</p>
						)}
					</div>
				</div>
			)}
		</div>
	);
};

export default DashboardListPage;
