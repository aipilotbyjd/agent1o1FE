import { FC, useMemo } from 'react';
import { Range, DateRange } from 'react-date-range';
import dayjs from 'dayjs';
import Icon from '@/components/icon/Icon';
import Button from '@/components/ui/Button';
import Input from '@/components/form/Input';
import Checkbox from '@/components/form/Checkbox';
import Dropdown, {
	DropdownMenu,
	DropdownItem,
	DropdownToggle,
	DropdownDivider,
} from '@/components/ui/Dropdown';
import colors from '@/tailwindcss/colors.tailwind';
import { TWorkflowStatus, TWorkflowSortBy, TSortOrder } from '@/types/workflow.type';
import { STATUS_OPTIONS, SORT_OPTIONS, TAG_OPTIONS } from '../_helper/helper';

interface IFiltersPartialProps {
	statusFilter: TWorkflowStatus | '';
	setStatusFilter: (status: TWorkflowStatus | '') => void;
	sortBy: TWorkflowSortBy;
	setSortBy: (sort: TWorkflowSortBy) => void;
	sortOrder: TSortOrder;
	setSortOrder: (order: TSortOrder) => void;
	selectedTags: string[];
	setSelectedTags: (tags: string[]) => void;
	tagSearchQuery: string;
	setTagSearchQuery: (query: string) => void;
	dateRange: Range[];
	setDateRange: (range: Range[]) => void;
}

const FiltersPartial: FC<IFiltersPartialProps> = ({
	statusFilter,
	setStatusFilter,
	sortBy,
	setSortBy,
	sortOrder,
	setSortOrder,
	selectedTags,
	setSelectedTags,
	tagSearchQuery,
	setTagSearchQuery,
	dateRange,
	setDateRange,
}) => {
	const hasDateFilter = dateRange[0].startDate && dateRange[0].endDate;
	const currentStatusOption = STATUS_OPTIONS.find((opt) => opt.value === statusFilter);
	const currentSortOption = SORT_OPTIONS.find((opt) => opt.value === sortBy);

	const filteredTags = useMemo(
		() =>
			TAG_OPTIONS.filter((tag) =>
				tag.label.toLowerCase().includes(tagSearchQuery.toLowerCase()),
			),
		[tagSearchQuery],
	);

	const toggleTag = (tagValue: string) => {
		setSelectedTags(
			selectedTags.includes(tagValue)
				? selectedTags.filter((t) => t !== tagValue)
				: [...selectedTags, tagValue],
		);
	};

	const clearDateFilter = () => {
		setDateRange([{ startDate: undefined, endDate: undefined, key: 'selection' }]);
	};

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
							onClick={() => setStatusFilter(opt.value as TWorkflowStatus | '')}>
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
						<DropdownItem key={opt.value} onClick={() => setSortBy(opt.value as TWorkflowSortBy)}>
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

			{/* Date Filter */}
			<Dropdown>
				<DropdownToggle hasIcon={false}>
					<Button
						aria-label='Date filter'
						variant={hasDateFilter ? 'solid' : 'outline'}
						color={hasDateFilter ? 'primary' : 'zinc'}
						dimension='sm'
						rightIcon='ChevronDown'>
						<Icon icon='Calendar01' className='me-1' />
						{hasDateFilter
							? `${dayjs(dateRange[0].startDate).format('MMM D')} - ${dayjs(dateRange[0].endDate).format('MMM D')}`
							: 'Date'}
					</Button>
				</DropdownToggle>
				<DropdownMenu placement='bottom-end'>
					<DateRange
						editableDateInputs
						onChange={(item) => setDateRange([item.selection])}
						moveRangeOnFirstSelection={false}
						ranges={dateRange}
						color={colors.primary['500']}
					/>
					{hasDateFilter && (
						<div className='border-t border-zinc-200 px-3 py-2 dark:border-zinc-700'>
							<Button
								aria-label='Clear date'
								variant='link'
								color='red'
								dimension='xs'
								className='w-full'
								onClick={clearDateFilter}>
								Clear date filter
							</Button>
						</div>
					)}
				</DropdownMenu>
			</Dropdown>

			{/* Tags Filter */}
			<Dropdown>
				<DropdownToggle hasIcon={false}>
					<Button
						aria-label='Tags filter'
						variant={selectedTags.length > 0 ? 'solid' : 'outline'}
						color={selectedTags.length > 0 ? 'primary' : 'zinc'}
						dimension='sm'
						className='relative'>
						<Icon icon='Tag01' size='text-lg' />
						{selectedTags.length > 0 && (
							<span className='absolute -top-1.5 -right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-xs font-semibold text-white'>
								{selectedTags.length}
							</span>
						)}
					</Button>
				</DropdownToggle>
				<DropdownMenu placement='bottom-end' className='w-64'>
					{/* Header */}
					<div className='flex items-center justify-between px-3 py-2'>
						<div className='flex items-center gap-2'>
							<Icon icon='Tag01' size='text-xl' className='text-zinc-500' />
							<span className='font-semibold text-zinc-900 dark:text-white'>
								Tags
							</span>
						</div>
					</div>
					<DropdownDivider />
					{/* Search */}
					<div className='-mx-2'>
						<Input
							name='tagSearch'
							variant='underline'
							className='w-full'
							placeholder='Search tags...'
							dimension='sm'
							type='search'
							value={tagSearchQuery}
							onChange={(e) => setTagSearchQuery(e.target.value)}
						/>
					</div>
					{/* Tags List */}
					<div className='max-h-48 overflow-y-auto'>
						{selectedTags.length > 0 && (
							<>
								<div className='px-3 py-1.5 text-xs font-medium text-zinc-400'>
									Selected
								</div>
								{TAG_OPTIONS.filter((tag) => selectedTags.includes(tag.value)).map(
									(tag) => (
										<DropdownItem
											key={tag.value}
											className='gap-2'
											onClick={() => toggleTag(tag.value)}>
											<Icon
												icon={tag.icon}
												color={tag.color}
												size='text-xl'
											/>
											<span className='flex-1'>{tag.label}</span>
											<Checkbox dimension='sm' checked onChange={() => {}} />
										</DropdownItem>
									),
								)}
								<DropdownDivider />
							</>
						)}
						<div className='px-3 py-1.5 text-xs font-medium text-zinc-400'>
							{selectedTags.length > 0 ? 'Available' : 'All tags'}
						</div>
						{filteredTags
							.filter((tag) => !selectedTags.includes(tag.value))
							.map((tag) => (
								<DropdownItem
									key={tag.value}
									className='gap-2'
									onClick={() => toggleTag(tag.value)}>
									<Icon
										icon={tag.icon}
										color={tag.color}
										size='text-xl'
									/>
									<span className='flex-1'>{tag.label}</span>
									<Checkbox dimension='sm' checked={false} onChange={() => {}} />
								</DropdownItem>
							))}
						{filteredTags.length === 0 && (
							<div className='px-3 py-4 text-center text-sm text-zinc-400'>
								No tags found
							</div>
						)}
					</div>
					{/* Footer */}
					{selectedTags.length > 0 && (
						<>
							<DropdownDivider />
							<div className='px-3 py-2'>
								<Button
									aria-label='Clear tags'
									variant='link'
									color='red'
									dimension='xs'
									className='w-full'
									onClick={() => setSelectedTags([])}>
									Clear all tags
								</Button>
							</div>
						</>
					)}
				</DropdownMenu>
			</Dropdown>
		</>
	);
};

export default FiltersPartial;
