import { useMemo } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import Icon from '@/components/icon/Icon';
import type { TAgentSkill } from '@/types/agent.type';

interface IStatsCardsPartialProps {
	skills: TAgentSkill[];
}

const StatsCardsPartial = ({ skills }: IStatsCardsPartialProps) => {
	const stats = useMemo(() => {
		const total = skills.length;
		const byType = {
			api_call: skills.filter((s) => s.type === 'api_call').length,
			vector_search: skills.filter((s) => s.type === 'vector_search').length,
			workflow: skills.filter((s) => s.type === 'workflow').length,
			script: skills.filter((s) => s.type === 'script').length,
		};

		return { total, byType };
	}, [skills]);

	return (
		<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-5'>
			<Card>
				<CardBody>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
							<Icon icon='Tools' color='violet' size='text-2xl' />
						</div>
						<div>
							<div className='text-2xl font-semibold'>{stats.total}</div>
							<div className='text-sm text-zinc-500'>Total Skills</div>
						</div>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
							<Icon icon='Link01' color='blue' size='text-2xl' />
						</div>
						<div>
							<div className='text-2xl font-semibold'>{stats.byType.api_call}</div>
							<div className='text-sm text-zinc-500'>API Calls</div>
						</div>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
							<Icon icon='Search01' color='violet' size='text-2xl' />
						</div>
						<div>
							<div className='text-2xl font-semibold'>{stats.byType.vector_search}</div>
							<div className='text-sm text-zinc-500'>Vector Search</div>
						</div>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-900/30'>
							<Icon icon='GitMerge' color='emerald' size='text-2xl' />
						</div>
						<div>
							<div className='text-2xl font-semibold'>{stats.byType.workflow}</div>
							<div className='text-sm text-zinc-500'>Workflows</div>
						</div>
					</div>
				</CardBody>
			</Card>

			<Card>
				<CardBody>
					<div className='flex items-center gap-3'>
						<div className='flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30'>
							<Icon icon='Code' color='amber' size='text-2xl' />
						</div>
						<div>
							<div className='text-2xl font-semibold'>{stats.byType.script}</div>
							<div className='text-sm text-zinc-500'>Scripts</div>
						</div>
					</div>
				</CardBody>
			</Card>
		</div>
	);
};

export default StatsCardsPartial;
