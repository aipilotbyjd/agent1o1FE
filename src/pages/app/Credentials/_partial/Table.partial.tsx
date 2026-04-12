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
import Dropdown, { DropdownMenu, DropdownItem, DropdownToggle } from '@/components/ui/Dropdown';
import TableTemplate, { TableCardFooterTemplate } from '@/templates/common/TableParts.template';
import Icon from '@/components/icon/Icon';
import { ICredential, TCredentialType, TSharingScope } from '@/types/credential.type';
import { TYPE_COLORS, SHARING_SCOPE_CONFIG } from '../_helper/helper';

const columnHelper = createColumnHelper<ICredential>();

interface ITablePartialProps {
	data: ICredential[];
	sorting: SortingState;
	onSortingChange: (sorting: SortingState) => void;
	onEdit: (credential: ICredential) => void;
	onTest: (credential: ICredential) => void;
	onDelete: (credential: ICredential) => void;
	onShare?: (credential: ICredential) => void;
}

const TablePartial: FC<ITablePartialProps> = ({
	data,
	sorting,
	onSortingChange,
	onEdit,
	onTest,
	onDelete,
	onShare,
}) => {
	const columns = useMemo(
		() => [
			columnHelper.accessor('name', {
				cell: (info) => {
					const credential = info.row.original;
					return (
						<div className='flex flex-col gap-1'>
							<div className='flex items-center gap-2'>
								<span className='font-medium text-zinc-900 dark:text-white'>
									{info.getValue()}
								</span>
								{!credential.is_owner && (
									<Badge variant='outline' color='amber' className='text-[10px]'>
										Shared with you
									</Badge>
								)}
							</div>
							{credential.description && (
								<span className='text-sm text-zinc-500'>
									{credential.description}
								</span>
							)}
						</div>
					);
				},
				header: () => 'Name',
			}),
			columnHelper.accessor('type', {
				cell: (info) => (
					<Badge variant='soft' color={TYPE_COLORS[info.getValue() as TCredentialType]}>
						{info.getValue().replace('_', ' ')}
					</Badge>
				),
				header: () => 'Type',
			}),
			columnHelper.accessor('sharing_scope', {
				cell: (info) => {
					const scope = info.getValue() as TSharingScope;
					const config = SHARING_SCOPE_CONFIG[scope];
					return (
						<div className='flex items-center gap-1.5'>
							<Icon icon={config.icon} className={`text-sm ${config.textColor}`} />
							<span className='text-sm text-zinc-600 dark:text-zinc-400'>
								{config.label}
							</span>
						</div>
					);
				},
				header: () => 'Sharing',
			}),
			columnHelper.accessor('last_used_at', {
				cell: (info) => {
					const value = info.getValue();
					return value ? new Date(value * 1000).toLocaleDateString() : 'Never';
				},
				header: () => 'Last Used',
			}),
			columnHelper.accessor('created_at', {
				cell: (info) => new Date(info.getValue() * 1000).toLocaleDateString(),
				header: () => 'Created',
			}),
			columnHelper.display({
				id: 'actions',
				cell: (info) => {
					const credential = info.row.original;
					return (
						<Dropdown>
							<DropdownToggle hasIcon={false}>
								<Button aria-label='Actions' icon='MoreVertical' variant='link' />
							</DropdownToggle>
							<DropdownMenu placement='bottom-end'>
								{credential.can_edit && (
									<DropdownItem
										icon='PencilEdit02'
										onClick={() => onEdit(credential)}>
										Edit
									</DropdownItem>
								)}
								<DropdownItem icon='TestTube01' onClick={() => onTest(credential)}>
									Test Connection
								</DropdownItem>
								{credential.can_share && onShare && (
									<DropdownItem
										icon='Share01'
										onClick={() => onShare(credential)}>
										Share
									</DropdownItem>
								)}
								{credential.can_edit && (
									<DropdownItem
										icon='Delete02'
										className='text-red-500'
										onClick={() => onDelete(credential)}>
										Delete
									</DropdownItem>
								)}
							</DropdownMenu>
						</Dropdown>
					);
				},
				header: () => 'Actions',
			}),
		],
		[onEdit, onTest, onDelete, onShare],
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
							icon: 'Key01',
							color: 'blue',
							size: 'text-3xl',
						}}>
						Credentials
					</CardTitle>
				</CardHeaderChild>
				<CardHeaderChild>
					<span className='text-sm text-zinc-500'>
						{data.length} credential{data.length !== 1 ? 's' : ''}
					</span>
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
