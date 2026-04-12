import { FC } from 'react';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import Dropdown, {
	DropdownMenu,
	DropdownItem,
	DropdownToggle,
	DropdownDivider,
} from '@/components/ui/Dropdown';
import { TCredentialType, TCredentialSortBy, TSortOrder } from '@/types/credential.type';
import { TYPE_OPTIONS, SORT_OPTIONS } from '../_helper/helper';

interface IFiltersPartialProps {
	typeFilter: TCredentialType | '';
	setTypeFilter: (type: TCredentialType | '') => void;
	sortBy: TCredentialSortBy;
	setSortBy: (sort: TCredentialSortBy) => void;
	sortOrder: TSortOrder;
	setSortOrder: (order: TSortOrder) => void;
}

const FiltersPartial: FC<IFiltersPartialProps> = ({
	typeFilter,
	setTypeFilter,
	sortBy,
	setSortBy,
	sortOrder,
	setSortOrder,
}) => {
	const currentTypeOption = TYPE_OPTIONS.find((opt) => opt.value === typeFilter);
	const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);

	return (
		<>
			{/* Type Filter */}
			<Dropdown>
				<DropdownToggle hasIcon={false}>
					<Button
						variant={typeFilter ? 'solid' : 'outline'}
						color={typeFilter ? 'primary' : undefined}
						dimension='sm'
						rightIcon='ChevronDown'>
						{currentTypeOption?.icon && (
							<Icon icon={currentTypeOption.icon} className='me-1' />
						)}
						{currentTypeOption?.label || 'Type'}
					</Button>
				</DropdownToggle>
				<DropdownMenu placement='bottom-end'>
					{TYPE_OPTIONS.map((opt) => (
						<DropdownItem
							key={opt.value}
							onClick={() => setTypeFilter(opt.value as TCredentialType | '')}>
							<Icon
								icon={opt.icon}
								color={opt.color}
								className='me-2'
								size='text-lg'
							/>
							{opt.label}
							{typeFilter === opt.value && (
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
