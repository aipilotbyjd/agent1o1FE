import { useMemo } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import Icon from '@/components/icon/Icon';
import type { TAgent } from '@/types/agent.type';

interface IStatsCardsPartialProps {
    agents: TAgent[];
}

const StatsCardsPartial = ({ agents }: IStatsCardsPartialProps) => {
    const stats = useMemo(() => {
        const total = agents.length;
        const active = agents.filter((a) => a.is_active).length;
        const totalConversations = agents.reduce((sum, a) => sum + a.conversations_count, 0);
        const avgSkills = total > 0 ? agents.reduce((sum, a) => sum + a.skills_count, 0) / total : 0;

        return { total, active, totalConversations, avgSkills };
    }, [agents]);

    return (
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4'>
            <Card>
                <CardBody>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 dark:bg-primary-900/30'>
                            <Icon icon='Bot' color='primary' size='text-2xl' />
                        </div>
                        <div>
                            <div className='text-2xl font-semibold'>{stats.total}</div>
                            <div className='text-sm text-zinc-500'>Total Agents</div>
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
                            <div className='text-sm text-zinc-500'>Active Agents</div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30'>
                            <Icon icon='Message02' color='blue' size='text-2xl' />
                        </div>
                        <div>
                            <div className='text-2xl font-semibold'>{stats.totalConversations}</div>
                            <div className='text-sm text-zinc-500'>Conversations</div>
                        </div>
                    </div>
                </CardBody>
            </Card>

            <Card>
                <CardBody>
                    <div className='flex items-center gap-3'>
                        <div className='flex h-12 w-12 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
                            <Icon icon='Tools' color='violet' size='text-2xl' />
                        </div>
                        <div>
                            <div className='text-2xl font-semibold'>{stats.avgSkills.toFixed(1)}</div>
                            <div className='text-sm text-zinc-500'>Avg Skills</div>
                        </div>
                    </div>
                </CardBody>
            </Card>
        </div>
    );
};

export default StatsCardsPartial;
