import { FC, useCallback, useState, useMemo } from 'react';
import { Node } from '@xyflow/react';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Label from '@/components/form/Label';
import Textarea from '@/components/form/Textarea';
import Select from '@/components/form/Select';
import Checkbox from '@/components/form/Checkbox';
import {
	ExpressionEngine,
	createExecutionContext,
	IExpressionContext,
} from '@/utils/expressionEngine.util';
import classNames from 'classnames';
import { INodeParameter } from '../_helper/nodeTypes.helper';
import { IEditorNodeData } from '../_helper/serializer.helper';
import useNodeTypesWithApi from '../_helper/useNodeTypes.hook';
import { useFetchCredentials as useCredentials } from '@/api/hooks/useCredentials';
import { useCurrentWorkspaceId } from '@/context/workspaceContext';
import Dropdown, { DropdownItem, DropdownMenu, DropdownToggle } from '@/components/ui/Dropdown';

interface INodeConfigPanelPartialProps {
	node: Node | null;
	onClose: () => void;
	onNodeUpdate: (nodeId: string, data: Partial<IEditorNodeData>) => void;
	onNodeDelete: (nodeId: string) => void;
	onNodeDuplicate: (nodeId: string) => void;
	onTestNode?: (nodeId: string) => void;
	lastOutput?: unknown;
	incomingData?: Array<{
		nodeId: string;
		nodeLabel: string;
		data: unknown;
	}>;
}

const colorClasses: Record<string, string> = {
	emerald: 'bg-emerald-500',
	blue: 'bg-blue-500',
	amber: 'bg-amber-500',
	violet: 'bg-violet-500',
	pink: 'bg-pink-500',
	zinc: 'bg-zinc-500',
};

type TConfigTab = 'parameters' | 'input' | 'output';

const NodeConfigPanelPartial: FC<INodeConfigPanelPartialProps> = ({
	node,
	onClose,
	onNodeUpdate,
	onNodeDelete,
	onNodeDuplicate,
	onTestNode,
	lastOutput,
	incomingData,
}) => {
	const [activeTab, setActiveTab] = useState<TConfigTab>('parameters');
	const [testInput, setTestInput] = useState('{\n  "example": "data"\n}');
	const [isTestRunning, setIsTestRunning] = useState(false);
	const [expressionPreview, setExpressionPreview] = useState<Record<string, any>>({});

	const workspaceId = useCurrentWorkspaceId();
	const { getNodeTypeDefinition, isLoading: isLoadingTypes } = useNodeTypesWithApi();
	const { data: credentials } = useCredentials(workspaceId || undefined);

	const nodeData = node ? (node.data as unknown as IEditorNodeData) : null;
	const nodeDefinition = nodeData ? getNodeTypeDefinition(nodeData.type) : null;
	const color = nodeDefinition?.color || 'blue';

	// Create execution context for expression evaluation
	const executionContext = useMemo<IExpressionContext>(() => {
		const previousNodeOutputs: Record<string, any> = {};

		if (incomingData) {
			incomingData.forEach((source) => {
				previousNodeOutputs[source.nodeLabel] = source.data;
			});
		}

		return createExecutionContext(
			nodeData?.parameters || {},
			previousNodeOutputs,
			{}, // environment vars
			{}, // workflow vars
		);
	}, [incomingData, nodeData]);

	// Evaluate expressions in parameters
	const evaluateExpressions = useCallback(
		(params: Record<string, any>) => {
			const evaluatedParams: Record<string, any> = {};

			for (const [key, value] of Object.entries(params)) {
				if (typeof value === 'string' && value.includes('{{') && value.includes('}}')) {
					try {
						const evaluated = ExpressionEngine.evaluateExpression(
							value,
							executionContext,
						);
						evaluatedParams[key] = evaluated;
						setExpressionPreview((prev) => ({
							...prev,
							[key]: evaluated,
						}));
					} catch (error) {
						console.error(`Expression evaluation failed for ${key}:`, error);
						evaluatedParams[key] = value;
					}
				} else {
					evaluatedParams[key] = value;
				}
			}

			return evaluatedParams;
		},
		[executionContext],
	);

	// Helper to evaluate showIf condition
	const evaluateShowIf = (showIf: string | undefined): boolean => {
		if (!showIf || !nodeData?.parameters) return true;

		try {
			// Supports basic equality checks and logic operators (&&, ||)
			// Example: "param1 === 'value' && param2 === true"
			// This is a naive implementation, meant for simple cases

			// Replace field references with values
			let expression = showIf;
			Object.entries(nodeData.parameters).forEach(([key, value]) => {
				const valStr = typeof value === 'string' ? `'${value}'` : String(value);
				// Regex to replace whole word match of the key
				const regex = new RegExp(`\\b${key}\\b`, 'g');
				expression = expression.replace(regex, valStr);
			});

			// Safety check: only allow limited set of characters
			if (!/^[a-zA-Z0-9_\s'"+*/%&|=!().-]+$/.test(expression)) {
				console.warn('Unsafe showIf expression:', showIf);
				return true;
			}

			return new Function(`return ${expression}`)();
		} catch {
			// Fallback to simple parser if eval fails
			const parts = showIf.split(/(\s*===|!==|==|!=\s*)/);
			if (parts.length === 3) {
				const field = parts[0].trim();
				const operator = parts[1].trim();
				const valueString = parts[2].trim();

				let compareValue: string | number | boolean | null = valueString;
				if (
					(valueString.startsWith("'") && valueString.endsWith("'")) ||
					(valueString.startsWith('"') && valueString.endsWith('"'))
				) {
					compareValue = valueString.slice(1, -1);
				} else if (valueString === 'true') {
					compareValue = true;
				} else if (valueString === 'false') {
					compareValue = false;
				} else if (valueString === 'null') {
					compareValue = null;
				} else if (!isNaN(Number(valueString))) {
					compareValue = Number(valueString);
				}

				const currentValue = nodeData.parameters[field];

				switch (operator) {
					case '===':
					case '==':
						return currentValue === compareValue;
					case '!==':
					case '!=':
						return currentValue !== compareValue;
					default:
						return true;
				}
			}
			return true;
		}
	};

	// Separate required and optional parameters, filtering by showIf
	const visibleParameters =
		nodeDefinition?.parameters?.filter((p) => evaluateShowIf(p.showIf)) || [];
	const requiredParams = visibleParameters.filter((p) => p.required);
	const optionalParams = visibleParameters.filter((p) => !p.required);

	const handleLabelChange = useCallback(
		(value: string) => {
			if (node && nodeData) {
				onNodeUpdate(node.id, { ...nodeData, label: value });
			}
		},
		[node, nodeData, onNodeUpdate],
	);

	const handleParameterChange = useCallback(
		(key: string, value: unknown) => {
			if (node && nodeData) {
				onNodeUpdate(node.id, {
					...nodeData,
					parameters: { ...nodeData.parameters, [key]: value },
				});
			}
		},
		[node, nodeData, onNodeUpdate],
	);

	const handleTestNode = async () => {
		if (!node || !onTestNode) return;
		setIsTestRunning(true);
		try {
			await onTestNode(node.id);
		} finally {
			setIsTestRunning(false);
			setActiveTab('output');
		}
	};

	const renderExpressionInput = (param: INodeParameter, value: string) => {
		const previewValue = expressionPreview[param.name];

		return (
			<div className='relative'>
				<Input
					name={param.name}
					value={value}
					onChange={(e) => handleParameterChange(param.name, e.target.value)}
					placeholder={param.placeholder || 'Enter value or {{expression}}'}
					dimension='sm'
					className='pr-16'
				/>

				{previewValue !== undefined && (
					<div className='absolute top-1/2 right-16 max-w-[80px] -translate-y-1/2 truncate text-[10px] text-zinc-400'>
						→ {String(previewValue)}
					</div>
				)}

				<Dropdown>
					<DropdownToggle hasIcon={false}>
						<button
							type='button'
							className='absolute top-1/2 right-2 -translate-y-1/2 text-zinc-400 hover:text-violet-500'>
							<Icon icon='Code' className='size-4' />
						</button>
					</DropdownToggle>
					<DropdownMenu placement='bottom-end' className='max-h-60 w-64 overflow-y-auto'>
						<div className='border-b border-zinc-100 px-3 py-2 text-xs font-semibold text-zinc-500'>
							Insert Variable
						</div>
						{incomingData && incomingData.length > 0 ? (
							incomingData.map((source) => (
								<DropdownItem
									key={source.nodeId}
									onClick={() => {
										const newValue = `${value}{{${source.nodeLabel || source.nodeId}.json}}`;
										handleParameterChange(param.name, newValue);
									}}>
									<div className='flex flex-col'>
										<span className='font-medium'>{source.nodeLabel}</span>
										<span className='text-[10px] text-zinc-400'>
											Output JSON
										</span>
									</div>
								</DropdownItem>
							))
						) : (
							<div className='p-3 text-center text-xs text-zinc-400'>
								No previous steps available
							</div>
						)}
						<div className='my-1 border-t border-zinc-100'></div>
						<DropdownItem
							onClick={() => handleParameterChange(param.name, `${value}{{$json.}}`)}>
							Current Node JSON
						</DropdownItem>
						<DropdownItem
							onClick={() => handleParameterChange(param.name, `${value}{{$env.}}`)}>
							Environment Variable
						</DropdownItem>
						<DropdownItem
							onClick={() => handleParameterChange(param.name, `${value}{{$vars.}}`)}>
							Workflow Variable
						</DropdownItem>
						<DropdownItem
							onClick={() =>
								handleParameterChange(param.name, `${value}{{$input.first()}}`)
							}>
							First Input Item
						</DropdownItem>
						<DropdownItem
							onClick={() =>
								handleParameterChange(param.name, `${value}{{$input.last()}}`)
							}>
							Last Input Item
						</DropdownItem>
					</DropdownMenu>
				</Dropdown>
			</div>
		);
	};

	const renderParameterInput = (param: INodeParameter) => {
		if (!nodeData) return null;
		const value = nodeData.parameters[param.name] ?? param.default ?? '';

		switch (param.type) {
			case 'string':
				return (
					<Input
						name={param.name}
						value={String(value)}
						onChange={(e) => handleParameterChange(param.name, e.target.value)}
						placeholder={param.placeholder}
						dimension='sm'
					/>
				);

			case 'expression':
				return renderExpressionInput(param, String(value));

			case 'number':
				return (
					<Input
						name={param.name}
						type='number'
						value={String(value)}
						onChange={(e) => handleParameterChange(param.name, Number(e.target.value))}
						dimension='sm'
					/>
				);

			case 'boolean':
				return (
					<Checkbox
						id={param.name}
						name={param.name}
						checked={Boolean(value)}
						onChange={(e) => handleParameterChange(param.name, e.target.checked)}
						label={param.description || param.label}
					/>
				);

			case 'select':
				return (
					<Select
						name={param.name}
						value={String(value)}
						onChange={(e) => handleParameterChange(param.name, e.target.value)}
						dimension='sm'>
						{param.options?.map((opt) => (
							<option key={opt.value} value={opt.value}>
								{opt.label}
							</option>
						))}
					</Select>
				);

			case 'credential':
				// Filter credentials by node type or tag if needed?
				// For now show all, maybe filter by type if credential type is known
				return (
					<div className='space-y-1'>
						<Select
							name={param.name}
							value={String(value)}
							onChange={(e) => handleParameterChange(param.name, e.target.value)}
							dimension='sm'
							className={classNames(!value && 'text-zinc-400')}>
							<option value='' disabled>
								Select a credential...
							</option>
							{credentials?.map((cred) => (
								<option key={cred.id} value={cred.id}>
									{cred.name} ({cred.type})
								</option>
							))}
						</Select>
						{(!credentials || credentials.length === 0) && (
							<p className='text-[10px] text-amber-500'>
								No credentials found. Create one in Settings.
							</p>
						)}
					</div>
				);

			case 'code':
				return (
					<Textarea
						name={param.name}
						value={String(value)}
						onChange={(e) => handleParameterChange(param.name, e.target.value)}
						rows={10}
						className='border-zinc-300 bg-zinc-50 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900'
						placeholder={param.placeholder}
					/>
				);

			case 'json':
				return (
					<Textarea
						name={param.name}
						value={typeof value === 'string' ? value : JSON.stringify(value, null, 2)}
						onChange={(e) => {
							try {
								const parsed = JSON.parse(e.target.value);
								handleParameterChange(param.name, parsed);
							} catch {
								handleParameterChange(param.name, e.target.value);
							}
						}}
						rows={8}
						className='border-zinc-300 bg-zinc-50 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900'
						placeholder={param.placeholder || '{}'}
					/>
				);

			default:
				return (
					<Input
						name={param.name}
						value={String(value)}
						onChange={(e) => handleParameterChange(param.name, e.target.value)}
						dimension='sm'
					/>
				);
		}
	};

	if (!node || !nodeData) return null;

	return (
		<div className='absolute top-0 right-0 z-20 flex h-full w-[480px] flex-col border-l border-zinc-200 bg-white shadow-2xl transition-all duration-300 ease-in-out dark:border-zinc-700 dark:bg-zinc-800'>
			{/* Header - N8n style */}
			<div className='flex flex-col border-b border-zinc-200 bg-zinc-50/50 p-4 backdrop-blur-sm dark:border-zinc-700 dark:bg-zinc-900/50'>
				<div className='mb-4 flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div
							className={classNames(
								'flex size-8 items-center justify-center rounded-lg shadow-sm',
								colorClasses[color],
							)}>
							<Icon
								icon={nodeDefinition?.icon || 'Circle'}
								className='size-5 text-white'
							/>
						</div>
						<div className='flex flex-col'>
							<span className='mb-1 text-sm leading-none font-bold text-zinc-900 dark:text-white'>
								{nodeDefinition?.label || nodeData.type}
							</span>
							<span className='text-[10px] font-semibold tracking-wider text-zinc-500 uppercase dark:text-zinc-400'>
								{nodeDefinition?.category}
							</span>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						<button
							onClick={onClose}
							className='rounded p-1.5 text-zinc-400 transition-colors hover:bg-zinc-200 hover:text-zinc-600 dark:hover:bg-zinc-700 dark:hover:text-zinc-300'>
							<Icon icon='Cancel01' className='size-4' />
						</button>
					</div>
				</div>

				{/* Module Renaming */}
				<div className='group relative'>
					<input
						type='text'
						value={nodeData.label}
						onChange={(e) => handleLabelChange(e.target.value)}
						className='w-full truncate border-none bg-transparent p-0 text-sm font-medium text-zinc-700 placeholder-zinc-400 transition-colors hover:text-zinc-900 focus:ring-0 dark:text-zinc-300 dark:hover:text-white'
						placeholder='Node Name'
					/>
					<div className='absolute top-1/2 right-0 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100'>
						<Icon icon='Edit02' className='size-3 text-zinc-400' />
					</div>
				</div>
			</div>

			{/* Tabs - Underlined Style */}
			<div className='flex border-b border-zinc-200 px-4 dark:border-zinc-700'>
				<button
					onClick={() => setActiveTab('parameters')}
					className={classNames(
						'border-b-2 px-4 py-3 text-xs font-semibold tracking-wide uppercase transition-all',
						activeTab === 'parameters'
							? 'border-zinc-900 text-zinc-900 dark:border-white dark:text-white'
							: 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
					)}>
					Parameters
				</button>
				<button
					onClick={() => setActiveTab('input')}
					className={classNames(
						'border-b-2 px-4 py-3 text-xs font-semibold tracking-wide uppercase transition-all',
						activeTab === 'input'
							? 'border-emerald-500 text-emerald-600 dark:border-emerald-400 dark:text-emerald-400'
							: 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
					)}>
					Input
				</button>
				<button
					onClick={() => setActiveTab('output')}
					className={classNames(
						'border-b-2 px-4 py-3 text-xs font-semibold tracking-wide uppercase transition-all',
						activeTab === 'output'
							? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
							: 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300',
					)}>
					Output
				</button>
			</div>

			{/* Content Area */}
			<div className='flex-1 overflow-y-auto bg-white p-5 dark:bg-zinc-800'>
				{/* Loading State */}
				{isLoadingTypes && !nodeDefinition && (
					<div className='flex h-full flex-col items-center justify-center space-y-3 opacity-60'>
						<div className='size-6 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-600 dark:border-zinc-700 dark:border-t-zinc-400' />
						<p className='text-xs text-zinc-500'>Loading definition...</p>
					</div>
				)}

				{/* Missing Definition State */}
				{!isLoadingTypes && !nodeDefinition && (
					<div className='flex h-full flex-col items-center justify-center space-y-3 p-8 text-center opacity-80'>
						<div className='flex size-12 items-center justify-center rounded-xl bg-amber-50 text-amber-500 dark:bg-amber-900/20 dark:text-amber-400'>
							<Icon icon='AlertTriangle' className='size-6' />
						</div>
						<div>
							<h3 className='text-sm font-semibold text-zinc-900 dark:text-zinc-100'>
								Unknown Node Type
							</h3>
							<p className='mt-1 text-xs text-zinc-500'>
								Definition for{' '}
								<code className='rounded bg-zinc-100 px-1 py-0.5 font-mono dark:bg-zinc-800'>
									{nodeData.type}
								</code>{' '}
								not found.
							</p>
						</div>
					</div>
				)}

				{activeTab === 'parameters' && nodeDefinition && (
					<div className='animate-in fade-in slide-in-from-bottom-2 space-y-6 duration-300'>
						{/* Description Box */}
						{nodeDefinition?.description && (
							<div className='rounded-lg border border-blue-100 bg-blue-50/50 p-3 dark:border-blue-900/30 dark:bg-blue-900/10'>
								<p className='text-xs leading-relaxed text-blue-700 dark:text-blue-300'>
									{nodeDefinition.description}
								</p>
							</div>
						)}

						{/* Required Parameters Group */}
						{requiredParams.length > 0 && (
							<div className='space-y-4'>
								{requiredParams.map((param) => (
									<div key={param.name} className='group'>
										{param.type !== 'boolean' && (
											<div className='mb-1.5 flex items-center justify-between'>
												<Label
													htmlFor={param.name}
													className='text-xs font-semibold text-zinc-700 dark:text-zinc-300'>
													{param.label}
													<span className='ml-0.5 text-red-500'>*</span>
												</Label>
												{/* Parameter tooltip/help could go here */}
											</div>
										)}
										{renderParameterInput(param)}
										{param.description && param.type !== 'boolean' && (
											<p className='mt-1 text-[10px] text-zinc-400 dark:text-zinc-500'>
												{param.description}
											</p>
										)}
									</div>
								))}
							</div>
						)}

						{/* Divider if both exist */}
						{requiredParams.length > 0 && optionalParams.length > 0 && (
							<div className='my-6 h-px bg-zinc-100 dark:bg-zinc-700/50' />
						)}

						{/* Optional Parameters Group */}
						{optionalParams.length > 0 && (
							<div className='space-y-4'>
								<div className='mb-4 flex items-center justify-between'>
									<h4 className='text-xs font-semibold tracking-wider text-zinc-400 uppercase'>
										Additional Options
									</h4>
								</div>

								{optionalParams.map((param) => (
									<div
										key={param.name}
										className='group border-l-2 border-transparent pl-2 transition-colors hover:border-zinc-200 dark:hover:border-zinc-700'>
										{param.type !== 'boolean' && (
											<Label
												htmlFor={param.name}
												className='mb-1.5 flex items-center text-xs font-medium text-zinc-600 dark:text-zinc-400'>
												{param.label}
											</Label>
										)}
										{renderParameterInput(param)}
										{param.description && param.type !== 'boolean' && (
											<p className='mt-1 text-[10px] text-zinc-400 dark:text-zinc-500'>
												{param.description}
											</p>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				)}

				{activeTab === 'input' && (
					<div className='animate-in fade-in slide-in-from-right-4 flex h-full flex-col space-y-6 duration-300'>
						{/* Incoming Data Section */}
						{incomingData && incomingData.length > 0 && (
							<div className='flex min-h-0 flex-1 flex-col'>
								<div className='mb-3 flex items-center justify-between'>
									<h4 className='flex items-center gap-2 text-xs font-bold tracking-wide text-zinc-900 uppercase dark:text-zinc-100'>
										<Icon
											icon='ArrowDownRight'
											className='size-3.5 text-emerald-500'
										/>
										Incoming Data
									</h4>
									<span className='rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'>
										{incomingData.length} Source
										{incomingData.length !== 1 ? 's' : ''}
									</span>
								</div>

								<div className='flex-1 space-y-4 overflow-y-auto'>
									{incomingData.map((source) => (
										<div
											key={source.nodeId}
											className='overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-900/50'>
											<div className='flex items-center gap-2 border-b border-zinc-200 bg-zinc-100/50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-800/50'>
												<Icon
													icon='Database01'
													className='size-3 text-zinc-400'
												/>
												<span className='text-xs font-medium text-zinc-700 dark:text-zinc-300'>
													{source.nodeLabel}
												</span>
												<span className='ml-auto font-mono text-[10px] text-zinc-400'>
													{source.nodeId}
												</span>
											</div>
											<div className='relative max-h-40 overflow-auto bg-zinc-900 p-2'>
												{source.data ? (
													<pre className='custom-scrollbar font-mono text-[10px] leading-relaxed text-emerald-400'>
														{JSON.stringify(source.data, null, 2)}
													</pre>
												) : (
													<div className='flex items-center justify-center py-4 text-[10px] text-zinc-500'>
														No data
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Schema Tree View */}
						<div className='flex min-h-0 flex-1 flex-col'>
							<div className='mb-3 flex items-center justify-between'>
								<h4 className='flex items-center gap-2 text-xs font-bold tracking-wide text-zinc-900 uppercase dark:text-zinc-100'>
									<Icon icon='BracketsCheck' className='size-3.5 text-blue-500' />
									Expected Schema
								</h4>
								<span className='rounded-full bg-zinc-100 px-2 py-0.5 text-[10px] text-zinc-500 dark:bg-zinc-700 dark:text-zinc-400'>
									Definition
								</span>
							</div>

							<div className='flex-1 overflow-y-auto rounded-lg border border-zinc-200 bg-zinc-50/50 p-2 dark:border-zinc-700 dark:bg-zinc-900/50'>
								{nodeDefinition?.schema?.inputs &&
								nodeDefinition.schema.inputs.length > 0 ? (
									<div className='space-y-1'>
										{nodeDefinition.schema.inputs.map((field) => (
											<div
												key={field.name}
												className='group flex items-start gap-2 rounded p-1.5 transition-colors hover:bg-white dark:hover:bg-zinc-800'>
												<code className='shrink-0 rounded border border-emerald-100 bg-emerald-50 px-1.5 py-0.5 font-mono text-xs text-emerald-600 dark:border-emerald-900/30 dark:bg-emerald-900/20 dark:text-emerald-400'>
													{field.name}
												</code>
												<div className='flex min-w-0 flex-col'>
													<div className='flex items-center gap-2'>
														<span className='text-[10px] font-semibold tracking-wider text-zinc-400 uppercase'>
															{field.type}
														</span>
														{field.required && (
															<span className='rounded bg-red-50 px-1 text-[9px] font-bold text-red-500 dark:bg-red-900/20'>
																REQ
															</span>
														)}
													</div>
													{(field.description || field.label) && (
														<p className='truncate text-[10px] text-zinc-500 group-hover:text-clip group-hover:whitespace-normal'>
															{field.description || field.label}
														</p>
													)}
												</div>
											</div>
										))}
									</div>
								) : (
									<div className='flex h-full flex-col items-center justify-center p-4 text-center opacity-60'>
										<Icon
											icon='BracketsCheck'
											className='mb-2 size-8 text-zinc-300'
										/>
										<p className='text-xs text-zinc-500'>
											Flexible input structure
										</p>
									</div>
								)}
							</div>
						</div>

						{/* Debug Tools */}
						<div className='mt-auto border-t border-zinc-100 pt-4 dark:border-zinc-700/50'>
							<details className='group'>
								<summary className='cursor-pointer list-none'>
									<div className='flex items-center justify-between rounded-lg bg-emerald-50 p-2 transition-colors hover:bg-emerald-100 dark:bg-emerald-900/10 dark:hover:bg-emerald-900/20'>
										<div className='flex items-center gap-2'>
											<Icon
												icon='Play'
												className='size-3.5 text-emerald-600 dark:text-emerald-400'
											/>
											<span className='text-xs font-semibold text-emerald-700 dark:text-emerald-300'>
												Test Step
											</span>
										</div>
										<Icon
											icon='ArrowDown01'
											className='size-3.5 text-emerald-500 transition-transform group-open:rotate-180'
										/>
									</div>
								</summary>

								<div className='animate-in slide-in-from-top-2 mt-2 space-y-3 duration-200'>
									<div>
										<div className='mb-1.5 flex items-center justify-between'>
											<Label
												htmlFor='testInput'
												className='text-[10px] font-medium text-zinc-500 uppercase'>
												Mock Input JSON
											</Label>
											<button
												onClick={() => setTestInput('{\n  \n}')}
												className='text-[10px] text-zinc-400 underline hover:text-zinc-600'>
												Clear
											</button>
										</div>
										<Textarea
											id='testInput'
											name='testInput'
											value={testInput}
											onChange={(e) => setTestInput(e.target.value)}
											rows={6}
											className='resize-none border-zinc-800 bg-zinc-900 font-mono text-[10px] leading-relaxed text-zinc-300 focus:ring-1 focus:ring-emerald-500'
											placeholder='{"key": "value"}'
										/>
									</div>
									<Button
										variant='solid'
										color='emerald'
										dimension='sm'
										className='h-8 w-full text-xs font-semibold shadow-lg shadow-emerald-500/20'
										onClick={handleTestNode}
										disabled={isTestRunning}>
										{isTestRunning ? 'Executing...' : 'Run Test'}
									</Button>
								</div>
							</details>
						</div>
					</div>
				)}

				{activeTab === 'output' && (
					<div className='animate-in fade-in slide-in-from-right-4 flex h-full flex-col space-y-6 duration-300'>
						{/* Output Schema */}
						<div className='flex-none'>
							<div className='mb-3 flex items-center justify-between'>
								<h4 className='flex items-center gap-2 text-xs font-bold tracking-wide text-zinc-900 uppercase dark:text-zinc-100'>
									<Icon icon='ArrowUpRight' className='size-3.5 text-blue-500' />
									Output Structure
								</h4>
							</div>

							<div className='max-h-40 overflow-y-auto rounded-lg border border-zinc-200 bg-white p-2 dark:border-zinc-700 dark:bg-zinc-900'>
								{nodeDefinition?.schema?.outputs &&
								nodeDefinition.schema.outputs.length > 0 ? (
									<div className='space-y-1'>
										{nodeDefinition.schema.outputs.map((field) => (
											<div
												key={field.name}
												className='flex items-center justify-between rounded border border-zinc-100 bg-zinc-50/50 p-1.5 dark:border-zinc-800 dark:bg-zinc-800/50'>
												<code className='font-mono text-xs text-blue-600 dark:text-blue-400'>
													{field.name}
												</code>
												<span className='text-[9px] font-medium text-zinc-400 uppercase'>
													{field.type}
												</span>
											</div>
										))}
									</div>
								) : (
									<p className='py-2 text-center text-xs text-zinc-400 italic'>
										Dynamic output
									</p>
								)}
							</div>
						</div>

						{/* Execution Result */}
						<div className='flex min-h-0 flex-1 flex-col border-t border-zinc-100 pt-4 dark:border-zinc-700/50'>
							<div className='mb-2 flex items-center justify-between'>
								<h4 className='text-xs font-bold tracking-wide text-zinc-900 uppercase dark:text-zinc-100'>
									Execution Result
								</h4>
								{!!lastOutput && (
									<span className='flex items-center gap-1.5 rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'>
										<span className='size-1.5 animate-pulse rounded-full bg-emerald-500' />
										Success
									</span>
								)}
							</div>

							<div className='group relative flex-1 overflow-hidden rounded-lg border border-zinc-200 bg-zinc-900 dark:border-zinc-700'>
								{lastOutput ? (
									<pre className='custom-scrollbar h-full overflow-auto p-3 font-mono text-[10px] leading-relaxed text-emerald-400'>
										{typeof lastOutput === 'string'
											? lastOutput
											: JSON.stringify(lastOutput, null, 2)}
									</pre>
								) : (
									<div className='absolute inset-0 flex flex-col items-center justify-center bg-zinc-50 text-zinc-600 dark:bg-zinc-900/50'>
										<Icon
											icon='Database01'
											className='mb-2 size-6 opacity-50'
										/>
										<p className='text-xs font-medium'>No data yet</p>
										<p className='text-[10px] opacity-70'>
											Run a test to see output
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				)}
			</div>

			{/* Footer Actions */}
			<div className='flex items-center gap-2 border-t border-zinc-200 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900'>
				<Button
					variant='outline'
					dimension='sm'
					className='flex-1 border-zinc-200 hover:bg-white dark:border-zinc-700 dark:hover:bg-zinc-800'
					onClick={() => onNodeDuplicate(node.id)}>
					<Icon icon='Copy01' className='mr-1.5 size-3.5' />
					Duplicate
				</Button>
				<Button
					variant='outline'
					dimension='sm'
					color='red'
					className='flex-1 border-red-200 transition-colors hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/20'
					onClick={() => onNodeDelete(node.id)}>
					<Icon icon='Delete02' className='mr-1.5 size-3.5' />
					Delete
				</Button>
			</div>
		</div>
	);
};

export default NodeConfigPanelPartial;
