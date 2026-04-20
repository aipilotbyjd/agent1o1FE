import { FC } from 'react';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import classNames from 'classnames';

export interface IVersionEntry {
	id: string;
	timestamp: Date;
	description: string;
	author?: string;
	nodeCount: number;
	isCurrent?: boolean;
}

interface IVersionHistoryPanelPartialProps {
	isOpen: boolean;
	onClose: () => void;
	versions: IVersionEntry[];
	onRestore: (versionId: string) => void;
	onPreview: (versionId: string) => void;
}

const VersionHistoryPanelPartial: FC<IVersionHistoryPanelPartialProps> = ({
	isOpen,
	onClose,
	versions,
	onRestore,
	onPreview,
}) => {
	const formatDate = (date: Date) => {
		const now = new Date();
		const diff = now.getTime() - date.getTime();
		const minutes = Math.floor(diff / 60000);
		const hours = Math.floor(diff / 3600000);
		const days = Math.floor(diff / 86400000);

		if (minutes < 1) return 'Just now';
		if (minutes < 60) return `${minutes}m ago`;
		if (hours < 24) return `${hours}h ago`;
		if (days < 7) return `${days}d ago`;
		return date.toLocaleDateString();
	};

	if (!isOpen) return null;

	return (
		<div className='absolute top-0 right-0 z-30 flex h-full w-80 flex-col border-l border-zinc-200 bg-white shadow-xl dark:border-zinc-700 dark:bg-zinc-800'>
			{/* Header */}
			<div className='flex items-center justify-between border-b border-zinc-200 p-4 dark:border-zinc-700'>
				<div className='flex items-center gap-2'>
					<Icon icon='Clock01' className='size-5 text-zinc-500' />
					<span className='font-semibold text-zinc-900 dark:text-zinc-100'>
						Version History
					</span>
				</div>
				<button
					type='button'
					onClick={onClose}
					className='flex size-8 items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700'>
					<Icon icon='Cancel01' className='size-4 text-zinc-500' />
				</button>
			</div>

			{/* Version List */}
			<div className='flex-1 overflow-y-auto'>
				{versions.length === 0 ? (
					<div className='flex h-full flex-col items-center justify-center p-4 text-center'>
						<Icon icon='Clock01' className='size-12 text-zinc-300 dark:text-zinc-600' />
						<p className='mt-2 text-sm text-zinc-500'>No version history yet</p>
						<p className='mt-1 text-xs text-zinc-400'>
							Versions are saved automatically
						</p>
					</div>
				) : (
					<div className='space-y-1 p-2'>
						{versions.map((version, index) => (
							<div
								key={version.id}
								className={classNames(
									'rounded-lg border p-3 transition-colors',
									version.isCurrent
										? 'border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20'
										: 'border-transparent hover:bg-zinc-50 dark:hover:bg-zinc-700/50',
								)}>
								<div className='flex items-start justify-between'>
									<div className='flex-1'>
										<div className='flex items-center gap-2'>
											<span className='text-sm font-medium text-zinc-900 dark:text-zinc-100'>
												{version.description}
											</span>
											{version.isCurrent && (
												<span className='rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-medium text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'>
													Current
												</span>
											)}
										</div>
										<div className='mt-1 flex items-center gap-2 text-xs text-zinc-500'>
											<span>{formatDate(version.timestamp)}</span>
											<span>·</span>
											<span>{version.nodeCount} nodes</span>
											{version.author && (
												<>
													<span>·</span>
													<span>{version.author}</span>
												</>
											)}
										</div>
									</div>
									{index === 0 && (
										<div className='flex size-6 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30'>
											<Icon
												icon='CheckmarkCircle02'
												className='size-4 text-emerald-600 dark:text-emerald-400'
											/>
										</div>
									)}
								</div>

								{!version.isCurrent && (
									<div className='mt-2 flex gap-2'>
										<Button
											variant='outline'
											className='flex-1 py-1 text-xs'
											onClick={() => onPreview(version.id)}>
											<Icon icon='Eye' className='mr-1 size-3' />
											Preview
										</Button>
										<Button
											variant='outline'
											className='flex-1 py-1 text-xs'
											onClick={() => onRestore(version.id)}>
											<Icon icon='RotateLeft01' className='mr-1 size-3' />
											Restore
										</Button>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>

			{/* Footer */}
			<div className='border-t border-zinc-200 p-4 dark:border-zinc-700'>
				<p className='text-xs text-zinc-500 dark:text-zinc-400'>
					Versions are saved automatically when you make changes. You can restore any
					previous version.
				</p>
			</div>
		</div>
	);
};

export default VersionHistoryPanelPartial;
