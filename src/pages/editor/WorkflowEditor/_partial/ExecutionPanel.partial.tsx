import { FC, useState } from 'react';
import Icon from '@/components/icon/Icon';
import classNames from 'classnames';

export interface IExecutionLogEntry {
	nodeId: string;
	nodeName: string;
	nodeType: string;
	status: 'running' | 'success' | 'error' | 'skipped';
	startTime: Date;
	endTime?: Date;
	inputData?: unknown;
	outputData?: unknown;
	error?: string;
	itemsCount?: number;
}

interface IExecutionPanelPartialProps {
	isOpen: boolean;
	onClose: () => void;
	logs: IExecutionLogEntry[];
	isRunning: boolean;
	onNodeClick: (nodeId: string) => void;
	onClearLogs: () => void;
}

const ExecutionPanelPartial: FC<IExecutionPanelPartialProps> = ({
	isOpen,
	onClose,
	logs,
	isRunning,
	onNodeClick,
	onClearLogs,
}) => {
	const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
	const [activeTab, setActiveTab] = useState<'input' | 'output'>('output');

	const toggleNode = (nodeId: string) => {
		setExpandedNodes((prev) => {
			const next = new Set(prev);
			if (next.has(nodeId)) {
				next.delete(nodeId);
			} else {
				next.add(nodeId);
			}
			return next;
		});
	};

	const formatDuration = (start: Date, end?: Date) => {
		if (!end) return 'Running...';
		const ms = end.getTime() - start.getTime();
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(2)}s`;
	};

	const getStatusIcon = (status: IExecutionLogEntry['status']) => {
		switch (status) {
			case 'running':
				return (
					<div className='size-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent' />
				);
			case 'success':
				return <Icon icon='CheckmarkCircle02' className='size-4 text-emerald-500' />;
			case 'error':
				return <Icon icon='AlertCircle' className='size-4 text-red-500' />;
			case 'skipped':
				return <Icon icon='MinusSignCircle' className='size-4 text-zinc-400' />;
		}
	};

	const formatJson = (data: unknown) => {
		try {
			return JSON.stringify(data, null, 2);
		} catch {
			return String(data);
		}
	};

	if (!isOpen) return null;

	return (
		<div className='absolute right-0 bottom-0 left-0 z-30 flex h-80 flex-col border-t border-zinc-200 bg-white dark:border-zinc-700 dark:bg-zinc-800'>
			{/* Header */}
			<div className='flex items-center justify-between border-b border-zinc-200 px-4 py-2 dark:border-zinc-700'>
				<div className='flex items-center gap-3'>
					<div className='flex items-center gap-2'>
						{isRunning ? (
							<div className='size-3 animate-pulse rounded-full bg-blue-500' />
						) : logs.some((l) => l.status === 'error') ? (
							<div className='size-3 rounded-full bg-red-500' />
						) : logs.length > 0 ? (
							<div className='size-3 rounded-full bg-emerald-500' />
						) : (
							<div className='size-3 rounded-full bg-zinc-300 dark:bg-zinc-600' />
						)}
						<span className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
							Execution Log
						</span>
					</div>
					{logs.length > 0 && (
						<span className='text-xs text-zinc-500'>
							{logs.filter((l) => l.status === 'success').length}/{logs.length} nodes
							completed
						</span>
					)}
				</div>
				<div className='flex items-center gap-2'>
					{logs.length > 0 && (
						<button
							type='button'
							onClick={onClearLogs}
							className='flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-700 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'>
							<Icon icon='Delete02' className='size-3' />
							Clear
						</button>
					)}
					<button
						type='button'
						onClick={onClose}
						className='flex size-7 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700'>
						<Icon icon='ArrowDown01' className='size-4 text-zinc-500' />
					</button>
				</div>
			</div>

			{/* Content */}
			<div className='flex flex-1 overflow-hidden'>
				{/* Node List */}
				<div className='w-72 shrink-0 overflow-y-auto border-r border-zinc-200 dark:border-zinc-700'>
					{logs.length === 0 ? (
						<div className='flex h-full flex-col items-center justify-center p-4 text-center'>
							<Icon
								icon='Play'
								className='size-10 text-zinc-300 dark:text-zinc-600'
							/>
							<p className='mt-2 text-sm text-zinc-500'>
								Run the workflow to see execution logs
							</p>
						</div>
					) : (
						<div className='space-y-1 p-2'>
							{logs.map((log, index) => (
								<button
									key={`${log.nodeId}-${index}`}
									type='button'
									onClick={() => {
										toggleNode(log.nodeId);
										onNodeClick(log.nodeId);
									}}
									className={classNames(
										'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors',
										expandedNodes.has(log.nodeId)
											? 'bg-blue-50 dark:bg-blue-900/20'
											: 'hover:bg-zinc-50 dark:hover:bg-zinc-700/50',
									)}>
									{getStatusIcon(log.status)}
									<div className='min-w-0 flex-1'>
										<div className='truncate text-sm font-medium text-zinc-900 dark:text-zinc-100'>
											{log.nodeName}
										</div>
										<div className='flex items-center gap-2 text-xs text-zinc-500'>
											<span>{log.nodeType}</span>
											<span>·</span>
											<span>
												{formatDuration(log.startTime, log.endTime)}
											</span>
											{log.itemsCount !== undefined && (
												<>
													<span>·</span>
													<span>{log.itemsCount} items</span>
												</>
											)}
										</div>
									</div>
									<Icon
										icon='ArrowRight01'
										className={classNames(
											'size-4 text-zinc-400 transition-transform',
											expandedNodes.has(log.nodeId) && 'rotate-90',
										)}
									/>
								</button>
							))}
						</div>
					)}
				</div>

				{/* Data Preview */}
				<div className='flex flex-1 flex-col overflow-hidden'>
					{expandedNodes.size > 0 ? (
						<>
							{/* Tabs */}
							<div className='flex border-b border-zinc-200 dark:border-zinc-700'>
								<button
									type='button'
									onClick={() => setActiveTab('input')}
									className={classNames(
										'px-4 py-2 text-sm font-medium transition-colors',
										activeTab === 'input'
											? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
											: 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
									)}>
									Input
								</button>
								<button
									type='button'
									onClick={() => setActiveTab('output')}
									className={classNames(
										'px-4 py-2 text-sm font-medium transition-colors',
										activeTab === 'output'
											? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
											: 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
									)}>
									Output
								</button>
							</div>

							{/* JSON Preview */}
							<div className='flex-1 overflow-auto p-4'>
								{(() => {
									const selectedLog = logs.find((l) =>
										expandedNodes.has(l.nodeId),
									);
									if (!selectedLog) return null;

									if (selectedLog.status === 'error' && selectedLog.error) {
										return (
											<div className='rounded-lg bg-red-50 p-4 dark:bg-red-900/20'>
												<div className='flex items-center gap-2 text-red-600 dark:text-red-400'>
													<Icon icon='AlertCircle' className='size-5' />
													<span className='font-medium'>Error</span>
												</div>
												<pre className='mt-2 text-sm whitespace-pre-wrap text-red-600 dark:text-red-400'>
													{selectedLog.error}
												</pre>
											</div>
										);
									}

									const data =
										activeTab === 'input'
											? selectedLog.inputData
											: selectedLog.outputData;

									if (!data) {
										return (
											<div className='flex h-full items-center justify-center text-zinc-400'>
												No {activeTab} data
											</div>
										);
									}

									return (
										<pre className='overflow-auto rounded-lg bg-zinc-900 p-4 font-mono text-xs text-emerald-400'>
											{formatJson(data)}
										</pre>
									);
								})()}
							</div>
						</>
					) : (
						<div className='flex h-full items-center justify-center text-zinc-400'>
							Select a node to view its data
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ExecutionPanelPartial;
