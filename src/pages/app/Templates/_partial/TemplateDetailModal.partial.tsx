import { FC, useState } from 'react';
import Modal, { ModalBody, ModalFooter, ModalHeader } from '@/components/ui/Modal';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Icon from '@/components/icon/Icon';
import Input from '@/components/form/Input';
import { ITemplate } from '@/types/template.type';
import { getCategoryColor, getCategoryIcon } from '../_helper/helper';

interface ITemplateDetailModalPartialProps {
	template: ITemplate | null;
	isOpen: boolean;
	onClose: () => void;
	onUse: (template: ITemplate, workflowName: string) => void;
	isUsing?: boolean;
}

const TemplateDetailModalPartial: FC<ITemplateDetailModalPartialProps> = ({
	template,
	isOpen,
	onClose,
	onUse,
	isUsing = false,
}) => {
	const [workflowName, setWorkflowName] = useState('');

	if (!template) return null;

	const handleUse = () => {
		onUse(template, workflowName || template.name);
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={() => onClose()} size='lg'>
			<ModalHeader>
				<div className='flex items-start gap-4'>
					{/* Integration icons */}
					<div className='flex -space-x-2'>
						{template.integrations.slice(0, 3).map((integration) => (
							<div
								key={integration.id}
								className='flex h-12 w-12 items-center justify-center rounded-xl border-2 border-white bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-700'>
								<Icon icon={integration.icon} size='text-2xl' />
							</div>
						))}
					</div>
					<div className='flex-1'>
						<h2 className='text-xl font-bold text-zinc-900 dark:text-white'>
							{template.name}
						</h2>
						<div className='mt-1 flex items-center gap-2'>
							<Badge
								variant='soft'
								color={getCategoryColor(template.category)}
								className='gap-1 text-xs'>
								<Icon
									icon={getCategoryIcon(template.category)}
									size='text-xs'
								/>
								{template.category}
							</Badge>
							{template.is_featured && (
								<Badge variant='solid' color='amber' className='gap-1 text-xs'>
									<Icon icon='Star' size='text-xs' />
									Featured
								</Badge>
							)}
						</div>
					</div>
				</div>
			</ModalHeader>

			<ModalBody>
				<div className='space-y-6'>
					{/* Description */}
					<div>
						<h4 className='mb-2 text-sm font-semibold text-zinc-900 dark:text-white'>
							Description
						</h4>
						<p className='text-sm leading-relaxed text-zinc-600 dark:text-zinc-400'>
							{template.description}
						</p>
					</div>

					{/* Publisher */}
					<div className='flex items-center gap-3 rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50'>
						<div className='flex h-10 w-10 items-center justify-center rounded-full bg-zinc-200 dark:bg-zinc-700'>
							<Icon icon='UserCircle' size='text-xl' />
						</div>
						<div>
							<div className='flex items-center gap-1'>
								<span className='text-sm font-medium text-zinc-900 dark:text-white'>
									{template.publisher.name}
								</span>
								{template.publisher.verified && (
									<Icon
										icon='CheckmarkBadge01'
										className='text-blue-500'
										size='text-sm'
									/>
								)}
							</div>
							<span className='text-xs text-zinc-500'>Publisher</span>
						</div>
					</div>

					{/* Stats */}
					<div className='grid grid-cols-2 gap-4'>
						<div className='rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50'>
							<div className='text-2xl font-bold text-zinc-900 dark:text-white'>
								{template.used_count.toLocaleString()}
							</div>
							<div className='text-xs text-zinc-500'>Times used</div>
						</div>
						<div className='rounded-lg bg-zinc-50 p-3 dark:bg-zinc-800/50'>
							<div className='text-2xl font-bold text-zinc-900 dark:text-white'>
								{template.integrations.length}
							</div>
							<div className='text-xs text-zinc-500'>Integrations</div>
						</div>
					</div>

					{/* Required credentials */}
					{template.required_credentials.length > 0 && (
						<div>
							<h4 className='mb-2 text-sm font-semibold text-zinc-900 dark:text-white'>
								Required Credentials
							</h4>
							<div className='flex flex-wrap gap-2'>
								{template.required_credentials.map((cred) => (
									<div
										key={cred.service_id}
										className='flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 dark:border-zinc-700'>
										<Icon icon={cred.icon} size='text-lg' />
										<span className='text-sm text-zinc-700 dark:text-zinc-300'>
											{cred.service_name}
										</span>
									</div>
								))}
							</div>
						</div>
					)}

					{/* Integrations */}
					<div>
						<h4 className='mb-2 text-sm font-semibold text-zinc-900 dark:text-white'>
							Integrations
						</h4>
						<div className='flex flex-wrap gap-2'>
							{template.integrations.map((integration) => (
								<Badge
									key={integration.id}
									variant='outline'
									className='gap-1.5 px-3 py-1.5'>
									<Icon icon={integration.icon} size='text-sm' />
									{integration.name}
								</Badge>
							))}
						</div>
					</div>

					{/* Workflow name input */}
					<div>
						<label className='mb-1 block text-sm font-medium text-zinc-700 dark:text-zinc-300'>
							Workflow Name
						</label>
						<Input
							name='workflowName'
							value={workflowName}
							onChange={(e) => setWorkflowName(e.target.value)}
							placeholder={template.name}
						/>
						<p className='mt-1 text-xs text-zinc-400'>
							Give your new workflow a name, or leave blank to use the template name.
						</p>
					</div>
				</div>
			</ModalBody>

			<ModalFooter>
				<Button variant='outline' onClick={onClose}>
					Cancel
				</Button>
				<Button
					variant='solid'
					icon='Rocket01'
					onClick={handleUse}
					isLoading={isUsing}>
					Use Template
				</Button>
			</ModalFooter>
		</Modal>
	);
};

export default TemplateDetailModalPartial;
