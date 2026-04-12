import { FC } from 'react';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import Dropdown, {
	DropdownMenu,
	DropdownItem,
	DropdownToggle,
	DropdownDivider,
} from '@/components/ui/Dropdown';
import { TTemplateCategory, TTemplateSortBy, TSortOrder } from '@/types/template.type';
import { CATEGORY_OPTIONS, SORT_OPTIONS } from '../_helper/helper';

interface IFiltersPartialProps {
	categoryFilter: TTemplateCategory | '';
	setCategoryFilter: (category: TTemplateCategory | '') => void;
	sortBy: TTemplateSortBy;
	setSortBy: (sort: TTemplateSortBy) => void;
	sortOrder: TSortOrder;
	setSortOrder: (order: TSortOrder) => void;
}

const FiltersPartial: FC<IFiltersPartialProps> = ({
	categoryFilter,
	setCategoryFilter,
	sortBy,
	setSortBy,
	sortOrder,
	setSortOrder,
}) => {
	const currentCategoryOption = CATEGORY_OPTIONS.find((opt) => opt.value === categoryFilter);
	const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);

	return (
		<>
			{/* Category Filter */}
			<Dropdown>
				<DropdownToggle hasIcon={false}>
					<Button
						variant={categoryFilter ? 'solid' : 'outline'}
						color={categoryFilter ? 'primary' : undefined}
						dimension='sm'
						rightIcon='ChevronDown'>
						{currentCategoryOption?.icon && (
							<Icon icon={currentCategoryOption.icon} className='me-1' />
						)}
						{currentCategoryOption?.label || 'Category'}
					</Button>
				</DropdownToggle>
				<DropdownMenu placement='bottom-end'>
					{CATEGORY_OPTIONS.map((opt) => (
						<DropdownItem
							key={opt.value}
							onClick={() => setCategoryFilter(opt.value as TTemplateCategory | '')}>
							<Icon
								icon={opt.icon}
								color={opt.color}
								className='me-2'
								size='text-lg'
							/>
							{opt.label}
							{categoryFilter === opt.value && (
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
