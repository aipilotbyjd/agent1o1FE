import { FC } from 'react';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import Dropdown, {
	DropdownMenu,
	DropdownItem,
	DropdownToggle,
	DropdownDivider,
} from '@/components/ui/Dropdown';
import { TVariableSortBy, TSortOrder } from '@/types/variable.type';
import { SORT_OPTIONS } from '../_helper/helper';

const SCOPE_OPTIONS = [
	{ value: null, label: 'All Scopes', icon: 'LayersTwo01' },
	{ value: 'Global', label: 'Global', icon: 'Globe02' },
	{ value: 'Local', label: 'Local', icon: 'Folder01' },
];

interface IFiltersPartialProps {
	scopeFilter: string | null;
	setScopeFilter: (scope: string | null) => void;
	sortBy: TVariableSortBy;
	setSortBy: (sort: TVariableSortBy) => void;
	sortOrder: TSortOrder;
	setSortOrder: (order: TSortOrder) => void;
}

const FiltersPartial: FC<IFiltersPartialProps> = ({
	scopeFilter,
	setScopeFilter,
	sortBy,
	setSortBy,
	sortOrder,
	setSortOrder,
}) => {
	const currentScopeOption = SCOPE_OPTIONS.find((opt) => opt.value === scopeFilter);
	const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);

	return (
		<>
			{/* Scope Filter */}
			<Dropdown>
				<DropdownToggle hasIcon={false}>
					<Button
						variant={scopeFilter !== null ? 'solid' : 'outline'}
						color={scopeFilter !== null ? 'primary' : undefined}
						dimension='sm'
						rightIcon='ChevronDown'>
						{currentScopeOption?.icon && (
							<Icon icon={currentScopeOption.icon} className='me-1' />
						)}
						{currentScopeOption?.label || 'Scope'}
					</Button>
				</DropdownToggle>
				<DropdownMenu placement='bottom-end'>
					{SCOPE_OPTIONS.map((opt) => (
						<DropdownItem
							key={String(opt.value)}
							onClick={() => setScopeFilter(opt.value)}>
							<Icon icon={opt.icon} className='me-2' size='text-lg' />
							{opt.label}
							{scopeFilter === opt.value && (
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
