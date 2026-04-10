import { FC, useMemo } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import Icon from '@/components/icon/Icon';
import { IWorkflow } from '@/types/workflow.type';

interface IStatsCardsPartialProps {
	workflows: IWorkflow[];
}

const StatsCardsPartial: FC<IStatsCardsPartialProps> = ({ workflows }) => {
	const stats = useMemo(() => {
		const total = workflows.length;
		const active = workflows.filter((w) => w.status === 'active').length;
		const inactive = workflows.filter((w) => w.status === 'inactive').length;
		const draft = workflows.filter((w) => w.status === 'draft').length;

		const totalExecutions = workflows.reduce((sum, w) => sum + (w.execution_count || 0), 0);

		// Calculate executions this week (mock - in real app would come from API)
		const oneWeekAgo = Date.now() / 1000 - 7 * 24 * 60 * 60;
		const recentlyRun = workflows.filter(
			(w) => w.last_executed_at && w.last_executed_at > oneWeekAgo,
		).length;

		return { total, active, inactive, draft, totalExecutions, recentlyRun };
	}, [workflows]);

	const cards = [
		{
			label: 'Total Workflows',
			value: stats.total,
			icon: 'GitMerge',
			color: 'primary',
			bgColor: 'bg-primary-100 dark:bg-primary-900/30',
			textColor: 'text-primary-600 dark:text-primary-400',
		},
		{
			label: 'Active',
			value: stats.active,
			icon: 'CheckmarkCircle02',
			color: 'emerald',
			bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
			textColor: 'text-emerald-600 dark:text-emerald-400',
		},
		{
			label: 'Inactive',
			value: stats.inactive,
			icon: 'PauseCircle',
			color: 'amber',
			bgColor: 'bg-amber-100 dark:bg-amber-900/30',
			textColor: 'text-amber-600 dark:text-amber-400',
		},
		{
			label: 'Total Executions',
			value: stats.totalExecutions.toLocaleString(),
			icon: 'PlayCircle',
			color: 'blue',
			bgColor: 'bg-blue-100 dark:bg-blue-900/30',
			textColor: 'text-blue-600 dark:text-blue-400',
		},
	];

	return (
		<div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
			{cards.map((card) => (
				<Card key={card.label} className='overflow-hidden'>
					<CardBody className='flex items-center gap-4'>
						<div
							className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${card.bgColor}`}>
							<Icon icon={card.icon} className={card.textColor} size='text-2xl' />
						</div>
						<div>
							<div className='text-2xl font-bold text-zinc-900 dark:text-white'>
								{card.value}
							</div>
							<div className='text-sm text-zinc-500'>{card.label}</div>
						</div>
					</CardBody>
				</Card>
			))}
		</div>
	);
};

export default StatsCardsPartial;
