import { FC, useState } from 'react';
import Icon from '@/components/icon/Icon';
import Input from '@/components/form/Input';
import FieldWrap from '@/components/form/FieldWrap';
import Modal, { ModalBody, ModalHeader } from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import classNames from 'classnames';
import { TIcons } from '@/types/icons.type';

export interface IWorkflowTemplate {
	id: string;
	name: string;
	description: string;
	category: string;
	icon: TIcons;
	color: string;
	nodeCount: number;
	nodes: unknown[];
	connections: unknown[];
}

interface ITemplatesModalPartialProps {
	isOpen: boolean;
	onClose: () => void;
	onSelectTemplate: (template: IWorkflowTemplate) => void;
}

const TEMPLATE_CATEGORIES = ['All', 'Sales', 'Marketing', 'Support', 'DevOps', 'Data', 'AI'];

const WORKFLOW_TEMPLATES: IWorkflowTemplate[] = [
	{
		id: 'webhook-to-slack',
		name: 'Webhook to Slack',
		description: 'Receive webhook data and post a message to Slack channel',
		category: 'DevOps',
		icon: 'Slack',
		color: 'pink',
		nodeCount: 2,
		nodes: [
			{
				id: '1',
				type: 'webhook',
				label: 'Webhook',
				position: { x: 0, y: 0 },
				parameters: { httpMethod: 'POST', path: '/webhook' },
			},
			{
				id: '2',
				type: 'slack',
				label: 'Slack',
				position: { x: 250, y: 0 },
				parameters: { channel: '#general', text: 'New webhook received!' },
			},
		],
		connections: [{ source: '1', target: '2' }],
	},
	{
		id: 'schedule-http-request',
		name: 'Scheduled API Call',
		description: 'Run an HTTP request on a schedule and process the response',
		category: 'Data',
		icon: 'Clock01',
		color: 'emerald',
		nodeCount: 3,
		nodes: [
			{
				id: '1',
				type: 'schedule',
				label: 'Schedule',
				position: { x: 0, y: 0 },
				parameters: { rule: 'everyHour' },
			},
			{
				id: '2',
				type: 'httpRequest',
				label: 'HTTP Request',
				position: { x: 250, y: 0 },
				parameters: { method: 'GET', url: 'https://api.example.com/data' },
			},
			{
				id: '3',
				type: 'set',
				label: 'Transform Data',
				position: { x: 500, y: 0 },
				parameters: {},
			},
		],
		connections: [
			{ source: '1', target: '2' },
			{ source: '2', target: '3' },
		],
	},
	{
		id: 'ai-content-generator',
		name: 'AI Content Generator',
		description: 'Generate content using OpenAI and send via email',
		category: 'AI',
		icon: 'OpenaiO1',
		color: 'violet',
		nodeCount: 3,
		nodes: [
			{
				id: '1',
				type: 'manual',
				label: 'Manual Trigger',
				position: { x: 0, y: 0 },
				parameters: {},
			},
			{
				id: '2',
				type: 'openai',
				label: 'OpenAI',
				position: { x: 250, y: 0 },
				parameters: { model: 'gpt-4o', prompt: 'Write a blog post about...' },
			},
			{
				id: '3',
				type: 'sendEmail',
				label: 'Send Email',
				position: { x: 500, y: 0 },
				parameters: { to: '', subject: 'Generated Content' },
			},
		],
		connections: [
			{ source: '1', target: '2' },
			{ source: '2', target: '3' },
		],
	},
	{
		id: 'data-sync',
		name: 'Database Sync',
		description: 'Sync data from Google Sheets to Postgres database',
		category: 'Data',
		icon: 'Database01',
		color: 'blue',
		nodeCount: 4,
		nodes: [
			{
				id: '1',
				type: 'schedule',
				label: 'Schedule',
				position: { x: 0, y: 0 },
				parameters: { rule: 'everyDay' },
			},
			{
				id: '2',
				type: 'googleSheets',
				label: 'Google Sheets',
				position: { x: 250, y: 0 },
				parameters: { operation: 'read' },
			},
			{ id: '3', type: 'loop', label: 'Loop', position: { x: 500, y: 0 }, parameters: {} },
			{
				id: '4',
				type: 'postgres',
				label: 'Postgres',
				position: { x: 750, y: 0 },
				parameters: { operation: 'insert' },
			},
		],
		connections: [
			{ source: '1', target: '2' },
			{ source: '2', target: '3' },
			{ source: '3', target: '4' },
		],
	},
	{
		id: 'conditional-workflow',
		name: 'Conditional Branching',
		description: 'Route data based on conditions using IF nodes',
		category: 'Data',
		icon: 'GitBranch',
		color: 'amber',
		nodeCount: 4,
		nodes: [
			{
				id: '1',
				type: 'webhook',
				label: 'Webhook',
				position: { x: 0, y: 0 },
				parameters: { httpMethod: 'POST' },
			},
			{
				id: '2',
				type: 'if',
				label: 'Check Condition',
				position: { x: 250, y: 0 },
				parameters: { value1: '{{$json.status}}', operation: 'equals', value2: 'active' },
			},
			{
				id: '3',
				type: 'slack',
				label: 'Notify Active',
				position: { x: 500, y: -80 },
				parameters: { channel: '#active' },
			},
			{
				id: '4',
				type: 'sendEmail',
				label: 'Email Inactive',
				position: { x: 500, y: 80 },
				parameters: {},
			},
		],
		connections: [
			{ source: '1', target: '2' },
			{ source: '2', target: '3', data: { label: 'true' } },
			{ source: '2', target: '4', data: { label: 'false' } },
		],
	},
	{
		id: 'error-handling',
		name: 'Error Handling',
		description: 'Workflow with error handling and notifications',
		category: 'DevOps',
		icon: 'AlertCircle',
		color: 'zinc',
		nodeCount: 4,
		nodes: [
			{
				id: '1',
				type: 'webhook',
				label: 'Webhook',
				position: { x: 0, y: 0 },
				parameters: {},
			},
			{
				id: '2',
				type: 'httpRequest',
				label: 'API Call',
				position: { x: 250, y: 0 },
				parameters: { url: 'https://api.example.com' },
			},
			{
				id: '3',
				type: 'set',
				label: 'Process',
				position: { x: 500, y: -80 },
				parameters: {},
			},
			{
				id: '4',
				type: 'error',
				label: 'Handle Error',
				position: { x: 500, y: 80 },
				parameters: { errorMessage: 'API call failed' },
			},
		],
		connections: [
			{ source: '1', target: '2' },
			{ source: '2', target: '3' },
		],
	},
];

const colorClasses: Record<string, string> = {
	emerald: 'bg-emerald-500',
	blue: 'bg-blue-500',
	amber: 'bg-amber-500',
	violet: 'bg-violet-500',
	pink: 'bg-pink-500',
	zinc: 'bg-zinc-500',
};

const TemplatesModalPartial: FC<ITemplatesModalPartialProps> = ({
	isOpen,
	onClose,
	onSelectTemplate,
}) => {
	const [search, setSearch] = useState('');
	const [selectedCategory, setSelectedCategory] = useState('All');

	const filteredTemplates = WORKFLOW_TEMPLATES.filter((template) => {
		const matchesSearch =
			!search.trim() ||
			template.name.toLowerCase().includes(search.toLowerCase()) ||
			template.description.toLowerCase().includes(search.toLowerCase());
		const matchesCategory =
			selectedCategory === 'All' || template.category === selectedCategory;
		return matchesSearch && matchesCategory;
	});

	const handleSelectTemplate = (template: IWorkflowTemplate) => {
		onSelectTemplate(template);
		onClose();
	};

	return (
		<Modal isOpen={isOpen} setIsOpen={onClose} size='xl'>
			<ModalHeader>
				<div className='flex items-center gap-3'>
					<div className='flex size-10 items-center justify-center rounded-xl bg-violet-100 dark:bg-violet-900/30'>
						<Icon
							icon='Template'
							className='size-5 text-violet-600 dark:text-violet-400'
						/>
					</div>
					<div>
						<h3 className='text-lg font-semibold text-zinc-900 dark:text-zinc-100'>
							Workflow Templates
						</h3>
						<p className='text-sm text-zinc-500'>Start with a pre-built workflow</p>
					</div>
				</div>
			</ModalHeader>
			<ModalBody className='p-0'>
				{/* Search */}
				<div className='border-b border-zinc-200 p-4 dark:border-zinc-700'>
					<FieldWrap
						firstSuffix={<Icon icon='Search01' className='size-4 text-zinc-400' />}>
						<Input
							name='search'
							placeholder='Search templates...'
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</FieldWrap>
				</div>

				<div className='flex h-[450px]'>
					{/* Categories */}
					<div className='w-40 shrink-0 border-r border-zinc-200 p-2 dark:border-zinc-700'>
						{TEMPLATE_CATEGORIES.map((category) => (
							<button
								key={category}
								type='button'
								onClick={() => setSelectedCategory(category)}
								className={classNames(
									'flex w-full items-center rounded-lg px-3 py-2 text-left text-sm transition-colors',
									selectedCategory === category
										? 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400'
										: 'text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800',
								)}>
								{category}
							</button>
						))}
					</div>

					{/* Templates Grid */}
					<div className='flex-1 overflow-y-auto p-4'>
						{filteredTemplates.length === 0 ? (
							<div className='flex h-full flex-col items-center justify-center text-center'>
								<Icon
									icon='Search01'
									className='size-12 text-zinc-300 dark:text-zinc-600'
								/>
								<p className='mt-2 text-sm text-zinc-500'>No templates found</p>
							</div>
						) : (
							<div className='grid grid-cols-2 gap-4'>
								{filteredTemplates.map((template) => (
									<button
										key={template.id}
										type='button'
										onClick={() => handleSelectTemplate(template)}
										className='group flex flex-col rounded-xl border border-zinc-200 bg-white p-4 text-left transition-all hover:border-violet-300 hover:shadow-lg dark:border-zinc-700 dark:bg-zinc-800 dark:hover:border-violet-700'>
										<div className='flex items-start gap-3'>
											<div
												className={classNames(
													'flex size-10 items-center justify-center rounded-lg transition-transform group-hover:scale-110',
													colorClasses[template.color],
												)}>
												<Icon
													icon={template.icon}
													className='size-5 text-white'
												/>
											</div>
											<div className='min-w-0 flex-1'>
												<div className='font-medium text-zinc-900 dark:text-zinc-100'>
													{template.name}
												</div>
												<div className='mt-0.5 text-xs text-zinc-500'>
													{template.nodeCount} nodes · {template.category}
												</div>
											</div>
										</div>
										<p className='mt-3 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400'>
											{template.description}
										</p>
										<div className='mt-3 flex justify-end'>
											<span className='text-xs font-medium text-violet-600 opacity-0 transition-opacity group-hover:opacity-100 dark:text-violet-400'>
												Use template →
											</span>
										</div>
									</button>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Footer */}
				<div className='flex items-center justify-between border-t border-zinc-200 p-4 dark:border-zinc-700'>
					<p className='text-xs text-zinc-500'>
						Templates provide a starting point. Customize them to fit your needs.
					</p>
					<Button variant='outline' onClick={onClose}>
						Start from Scratch
					</Button>
				</div>
			</ModalBody>
		</Modal>
	);
};

export default TemplatesModalPartial;
