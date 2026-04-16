import { useMemo } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import Icon from '@/components/icon/Icon';
import type { TWebhook } from '@/types/webhook.type';

interface IStatsCardsPartialProps {
	webhooks: TWebhook[];
}

const StatsCardsPartial = ({ webhooks }: IStatsCardsPartialProps) => {
	const stats = useMemo(() => {
		const total = webhooks.length;
		const active = webhooks.filter((w) => w.is_active).length;
		const totalCalls = webhooks.reduce((sum, w) => sum + w.calls_count, 0);
		const avgCalls = total > 0 ? Math.round(totalCalls / total) : 0;

		return { total, active, totalCalls, avgCalls };
	}, [webhooks]);

	return (
		<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
			<Card>
				<CardBody>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
							<Icon icon='Webhook' color='blue' size='text-2xl' />
						</div>
						<div>
							<div className='text-2xl font-semibold'>{stats.total}</div>
							<div className='text-sm text-zinc-500'>Total Webhooks</div>
						</div>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30'>
							<Icon icon='CheckmarkCircle02' color='emerald' size='text-2xl' />
						</div>
						<div>
							<div className='text-2xl font-semibold'>{stats.active}</div>
							<div className='text-sm text-zinc-500'>Active</div>
						</div>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
							<Icon icon='Activity' color='violet' size='text-2xl' />
						</div>
						<div>
							<div className='text-2xl font-semibold'>{stats.totalCalls}</div>
							<div className='text-sm text-zinc-500'>Total Calls</div>
						</div>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30'>
							<Icon icon='BarChart01' color='amber' size='text-2xl' />
						</div>
						<div>
							<div className='text-2xl font-semibold'>{stats.avgCalls}</div>
							<div className='text-sm text-zinc-500'>Avg Calls</div>
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
};

export default StatsCardsPartial;
