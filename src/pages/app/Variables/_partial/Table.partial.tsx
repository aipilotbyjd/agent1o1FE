import { FC, useMemo } from 'react';
import {
	createColumnHelper,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable,
} from '@tanstack/react-table';
import Card, { CardBody, CardHeader, CardHeaderChild, CardTitle } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Icon from '@/components/icon/Icon';
import Dropdown, { DropdownMenu, DropdownItem, DropdownToggle } from '@/components/ui/Dropdown';
import Tooltip from '@/components/ui/Tooltip';
import TableTemplate, { TableCardFooterTemplate } from '@/templates/common/TableParts.template';
import { IVariable } from '@/types/variable.type';
import { toast } from 'react-toastify';

const columnHelper = createColumnHelper<IVariable>();

interface ITablePartialProps {
	data: IVariable[];
	sorting: SortingState;
	onSortingChange: (sorting: SortingState) => void;
	onEdit: (variable: IVariable) => void;
	onDelete: (variable: IVariable) => void;
}

const TablePartial: FC<ITablePartialProps> = ({
	data,
	sorting,
	onSortingChange,
	onEdit,
	onDelete,
}) => {
	const copyToClipboard = (value: string, key: string) => {
		navigator.clipboard.writeText(value);
		toast.success(`Copied "${key}" to clipboard`);
	};

	const columns = useMemo(
		() => [
			columnHelper.accessor('key', {
				cell: (info) => (
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 items-center justify-center rounded-lg bg-violet-100 dark:bg-violet-900/30'>
							<Icon
								icon='Variable'
								className='text-violet-600 dark:text-violet-400'
							/>
						</div>
						<div className='flex flex-col'>
							<code className='font-mono text-sm font-semibold text-zinc-900 dark:text-white'>
								{info.getValue()}
							</code>
							{info.row.original.description && (
								<span className='max-w-xs truncate text-xs text-zinc-500'>
									{info.row.original.description}
								</span>
							)}
						</div>
					</div>
				),
				header: () => 'Key',
				size: 280,
			}),
			columnHelper.accessor('value', {
				cell: (info) => {
					const variable = info.row.original;
					const value = info.getValue();
					const truncatedValue =
						value.length > 50 ? `${value.substring(0, 50)}...` : value;

					return (
						<div className='flex items-center gap-2'>
							<code className='rounded bg-zinc-100 px-2 py-1 font-mono text-sm text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'>
								{truncatedValue}
							</code>
							<Tooltip text='Copy value'>
								<Button
									aria-label='Copy'
									icon='Copy01'
									variant='outline'
									color='zinc'
									dimension='xs'
									onClick={() => copyToClipboard(value, variable.key)}
								/>
							</Tooltip>
						</div>
					);
				},
				header: () => 'Value',
				size: 300,
			}),
			columnHelper.accessor('scope', {
				cell: (info) => {
					const scope = info.getValue();
					return (
						<Badge
							variant='soft'
							color={scope === 'Global' ? 'blue' : 'amber'}
							className='gap-1'>
							<Icon
								icon={scope === 'Global' ? 'Globe02' : 'Folder01'}
								size='text-xs'
							/>
							{scope}
						</Badge>
					);
				},
				header: () => 'Scope',
				size: 120,
			}),
			columnHelper.accessor('updated_at', {
				cell: (info) => {
					const date = new Date(info.getValue() * 1000);
					return (
						<span className='text-sm text-zinc-500'>
							{date.toLocaleDateString(undefined, {
								month: 'short',
								day: 'numeric',
								year: 'numeric',
							})}
						</span>
					);
				},
				header: () => 'Updated',
				size: 120,
			}),
			columnHelper.display({
				id: 'actions',
				cell: (info) => (
					<div className='flex items-center justify-start'>
						<Dropdown>
							<DropdownToggle hasIcon={false}>
								<Button
									aria-label='More actions'
									icon='MoreVertical'
									variant='default'
									color='zinc'
									dimension='xs'
								/>
							</DropdownToggle>
							<DropdownMenu placement='bottom-end'>
								<DropdownItem
									icon='PencilEdit02'
									onClick={() => onEdit(info.row.original)}>
									Edit Variable
								</DropdownItem>
								<DropdownItem
									icon='Copy01'
									onClick={() =>
										copyToClipboard(
											info.row.original.value,
											info.row.original.key,
										)
									}>
									Copy Value
								</DropdownItem>
								<DropdownItem
									icon='Copy02'
									onClick={() =>
										copyToClipboard(
											`{{${info.row.original.key}}}`,
											info.row.original.key,
										)
									}>
									Copy as Reference
								</DropdownItem>
								<DropdownItem
									icon='Delete02'
									className='text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
									onClick={() => onDelete(info.row.original)}>
									Delete Variable
								</DropdownItem>
							</DropdownMenu>
						</Dropdown>
					</div>
				),
				header: () => 'Action',
				size: 80,
			}),
		],
		[onEdit, onDelete],
	);

	const table = useReactTable({
		data,
		columns,
		state: { sorting },
		onSortingChange: (updater) => {
			const newSorting = typeof updater === 'function' ? updater(sorting) : updater;
			onSortingChange(newSorting);
		},
		getCoreRowModel: getCoreRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: {
			pagination: { pageSize: 10 },
		},
	});

	return (
		<Card className='h-full'>
			<CardHeader>
				<CardHeaderChild>
					<CardTitle
						iconProps={{
							icon: 'Variable',
							color: 'violet',
							size: 'text-3xl',
						}}>
						Environment Variables
					</CardTitle>
				</CardHeaderChild>
				<CardHeaderChild>
					<Badge variant='soft' color='zinc' className='text-sm'>
						{data.length} variable{data.length !== 1 ? 's' : ''}
					</Badge>
				</CardHeaderChild>
			</CardHeader>
			<CardBody className='overflow-auto'>
				<TableTemplate table={table} hasFooter={false} />
			</CardBody>
			<TableCardFooterTemplate table={table} />
		</Card>
	);
};

export default TablePartial;
