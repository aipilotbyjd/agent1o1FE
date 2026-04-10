import { FC } from 'react';
import Button from '@/components/ui/Button';
import classNames from 'classnames';

export type TViewMode = 'table' | 'grid' | 'compact';

interface IViewTogglePartialProps {
	viewMode: TViewMode;
	onViewModeChange: (mode: TViewMode) => void;
}

const views: { mode: TViewMode; icon: string; label: string }[] = [
	{ mode: 'table', icon: 'Menu01', label: 'Table' },
	{ mode: 'grid', icon: 'GridView', label: 'Grid' },
	{ mode: 'compact', icon: 'Menu02', label: 'Compact' },
];

const ViewTogglePartial: FC<IViewTogglePartialProps> = ({ viewMode, onViewModeChange }) => {
	return (
		<div className='flex items-center rounded-lg border border-zinc-200 p-0.5 dark:border-zinc-700'>
			{views.map((view) => (
				<Button
					key={view.mode}
					aria-label={view.label}
					icon={view.icon}
					variant='link'
					dimension='xs'
					className={classNames(
						'rounded-md px-2',
						viewMode === view.mode
							? 'bg-primary-100 text-primary-600 dark:bg-primary-900/30 dark:text-primary-400'
							: 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
					)}
					onClick={() => onViewModeChange(view.mode)}
				/>
			))}
		</div>
	);
};

export default ViewTogglePartial;
