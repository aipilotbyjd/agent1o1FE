import { FC } from 'react';
import Card, { CardBody } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Icon from '@/components/icon/Icon';
import { ITemplate } from '@/types/template.type';
import { getCategoryColor, getCategoryIcon } from '../_helper/helper';

interface ITemplateCardPartialProps {
	template: ITemplate;
	onClick: (template: ITemplate) => void;
}

const TemplateCardPartial: FC<ITemplateCardPartialProps> = ({ template, onClick }) => {
	return (
		<Card
			className='group relative cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-lg'
			onClick={() => onClick(template)}>
			{template.is_featured && (
				<div className='absolute top-3 right-3 z-10'>
					<Badge variant='solid' color='amber' className='gap-1 text-xs'>
						<Icon icon='Star' size='text-xs' />
						Featured
					</Badge>
				</div>
			)}

			<CardBody className='flex h-64 flex-col p-4'>
				{/* Integration icons */}
				<div className='mb-4 flex gap-2'>
					{template.integrations.slice(0, 3).map((integration) => (
						<div
							key={integration.id}
							className='flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800'>
							<Icon icon={integration.icon} size='text-xl' />
						</div>
					))}
					{template.integrations.length > 3 && (
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 text-xs font-medium text-zinc-500 dark:bg-zinc-800'>
							+{template.integrations.length - 3}
						</div>
					)}
				</div>

				{/* Name & description */}
				<h3 className='mb-1 line-clamp-1 text-base font-semibold text-zinc-900 dark:text-white'>
					{template.name}
				</h3>
				<p className='mb-4 line-clamp-2 text-sm text-zinc-500 dark:text-zinc-400'>
					{template.short_description || template.description}
				</p>

				{/* Footer */}
				<div className='mt-auto flex items-center justify-between'>
					<Badge
						variant='soft'
						color={getCategoryColor(template.category)}
						className='gap-1 text-xs'>
						<Icon icon={getCategoryIcon(template.category)} size='text-xs' />
						{template.category}
					</Badge>
					<span className='text-xs text-zinc-400'>
						{template.used_count.toLocaleString()} uses
					</span>
				</div>
			</CardBody>

			{/* Hover overlay */}
			<div className='absolute inset-0 rounded-xl bg-gradient-to-t from-black/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100 dark:from-white/5' />
		</Card>
	);
};

export default TemplateCardPartial;
