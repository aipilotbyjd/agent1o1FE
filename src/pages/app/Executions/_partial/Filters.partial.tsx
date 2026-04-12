import { FC } from 'react';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import Dropdown, {
	DropdownMenu,
	DropdownItem,
	DropdownToggle,
	DropdownDivider,
} from '@/components/ui/Dropdown';
import { TExecutionStatus, TExecutionTrigger } from '@/types/execution.type';
import { TExecutionSortBy, TSortOrder, STATUS_OPTIONS, TRIGGER_OPTIONS, SORT_OPTIONS } from '../_helper/helper';

interface IFiltersPartialProps {
	statusFilter: TExecutionStatus | '';
	setStatusFilter: (status: TExecutionStatus | '') => void;
	triggerFilter: TExecutionTrigger | '';
	setTriggerFilter: (trigger: TExecutionTrigger | '') => void;
	sortBy: TExecutionSortBy;
	setSortBy: (sort: TExecutionSortBy) => void;
	sortOrder: TSortOrder;
	setSortOrder: (order: TSortOrder) => void;
}

const FiltersPartial: FC<IFiltersPartialProps> = ({
	statusFilter,
	setStatusFilter,
	triggerFilter,
	setTriggerFilter,
	sortBy,
	setSortBy,
	sortOrder,
	setSortOrder,
}) => {
	const currentStatusOption = STATUS_OPTIONS.find((opt) => opt.value === statusFilter);
	const currentTriggerOption = TRIGGER_OPTIONS.find((opt) => opt.value === triggerFilter);
	const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);

	return (
		<>
			{/* Status Filter */}
			<Dropdown>
				<DropdownToggle hasIcon={false}>
					<Button
						variant={statusFilter ? 'solid' : 'outline'}
						color={statusFilter ? 'primary' : undefined}
						dimension='sm'
						rightIcon='ChevronDown'>
						{currentStatusOption?.icon && (
							<Icon icon={currentStatusOption.icon} className='me-1' />
						)}
						{currentStatusOption?.label || 'Status'}
					</Button>
				</DropdownToggle>
				<DropdownMenu placement='bottom-end'>
					{STATUS_OPTIONS.map((opt) => (
						<DropdownItem
							key={opt.value}
							onClick={() => setStatusFilter(opt.value as TExecutionStatus | '')}>
							<Icon
								icon={opt.icon}
								color={opt.color}
								className='me-2'
								size='text-lg'
							/>
							{opt.label}
							{statusFilter === opt.value && (
								<Icon icon='Tick02' color='primary' className='ms-auto' />
							)}
						</DropdownItem>
					))}
				</DropdownMenu>
			</Dropdown>

			{/* Trigger Filter */}
			<Dropdown>
				<DropdownToggle hasIcon={false}>
					<Button
						variant={triggerFilter ? 'solid' : 'outline'}
						color={triggerFilter ? 'primary' : undefined}
						dimension='sm'
						rightIcon='ChevronDown'>
						{currentTriggerOption?.icon && (
							<Icon icon={currentTriggerOption.icon} className='me-1' />
						)}
						{currentTriggerOption?.label || 'Trigger'}
					</Button>
				</DropdownToggle>
				<DropdownMenu placement='bottom-end'>
					{TRIGGER_OPTIONS.map((opt) => (
						<DropdownItem
							key={opt.value}
							onClick={() => setTriggerFilter(opt.value as TExecutionTrigger | '')}>
							<Icon
								icon={opt.icon}
								color={opt.color}
								className='me-2'
								size='text-lg'
							/>
							{opt.label}
							{triggerFilter === opt.value && (
								<Icon icon='Tick02' color='primary' className='ms-auto' />
							)}
						</DropdownItem>
					))}
				</DropdownMenu>
			</Dropdown>

			{/* Sort */}
			<Dropdown>
				<DropdownToggle hasIcon={false}>
					<Button variant='outline' dimension='sm' rightIcon='ChevronDown'>
						<Icon
							icon={sortOrder === 'desc' ? 'SortByDown01' : 'SortByUp01'}
							className='me-1'
						/>
						{currentSortOption?.label || 'Sort'}
					</Button>
				</DropdownToggle>
				<DropdownMenu placement='bottom-end'>
					{SORT_OPTIONS.map((opt) => (
						<DropdownItem key={opt.value} onClick={() => setSortBy(opt.value)}>
							<Icon icon={opt.icon} className='me-2' size='text-lg' />
							{opt.label}
							{sortBy === opt.value && (
								<Icon icon='Tick02' color='primary' className='ms-auto' />
							)}
						</DropdownItem>
					))}
					<DropdownDivider />
					<DropdownItem
						onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
						<Icon
							icon={sortOrder === 'desc' ? 'ArrowDown01' : 'ArrowUp01'}
							className='me-2'
							size='text-lg'
						/>
						{sortOrder === 'desc' ? 'Newest First' : 'Oldest First'}
						<Icon icon='Tick02' color='primary' className='ms-auto' />
					</DropdownItem>
				</DropdownMenu>
			</Dropdown>
		</>
	);
};

export default FiltersPartial;
