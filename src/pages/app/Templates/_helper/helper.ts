import { TTemplateCategory, TTemplateSortBy } from '@/types/template.type';
import { TColors } from '@/types/colors.type';

export const CATEGORY_COLORS: Record<TTemplateCategory, TColors> = {
	Marketing: 'violet',
	Sales: 'emerald',
	HR: 'sky',
	Finance: 'amber',
	Development: 'blue',
	Support: 'red',
	'Social Media': 'violet',
	'E-commerce': 'lime',
	Productivity: 'sky',
	Other: 'zinc',
};

export const CATEGORY_ICONS: Record<TTemplateCategory, string> = {
	Marketing: 'Megaphone01',
	Sales: 'ChartLineData01',
	HR: 'UserMultiple',
	Finance: 'Money02',
	Development: 'SourceCodeCircle',
	Support: 'CustomerService01',
	'Social Media': 'Share01',
	'E-commerce': 'ShoppingCart01',
	Productivity: 'Clock01',
	Other: 'MoreHorizontalCircle02',
};

export const getCategoryColor = (category: TTemplateCategory): TColors => {
	return CATEGORY_COLORS[category] || 'zinc';
};

export const getCategoryIcon = (category: TTemplateCategory): string => {
	return CATEGORY_ICONS[category] || 'Folder01';
};

export const CATEGORY_OPTIONS: {
	value: TTemplateCategory | '';
	label: string;
	icon: string;
	color?: TColors;
}[] = [
	{ value: '', label: 'All Categories', icon: 'Menu01' },
	{ value: 'Marketing', label: 'Marketing', icon: 'Megaphone01', color: 'violet' },
	{ value: 'Sales', label: 'Sales', icon: 'ChartLineData01', color: 'emerald' },
	{ value: 'HR', label: 'HR', icon: 'UserMultiple', color: 'sky' },
	{ value: 'Finance', label: 'Finance', icon: 'Money02', color: 'amber' },
	{ value: 'Development', label: 'Development', icon: 'SourceCodeCircle', color: 'blue' },
	{ value: 'Support', label: 'Support', icon: 'CustomerService01', color: 'red' },
	{ value: 'Social Media', label: 'Social Media', icon: 'Share01', color: 'violet' },
	{ value: 'E-commerce', label: 'E-commerce', icon: 'ShoppingCart01', color: 'lime' },
	{ value: 'Productivity', label: 'Productivity', icon: 'Clock01', color: 'sky' },
	{ value: 'Other', label: 'Other', icon: 'MoreHorizontalCircle02', color: 'zinc' },
];

export const SORT_OPTIONS: { value: TTemplateSortBy; label: string; icon: string }[] = [
	{ value: 'created_at', label: 'Created', icon: 'Calendar03' },
	{ value: 'used_count', label: 'Most Popular', icon: 'Activity01' },
	{ value: 'name', label: 'Name', icon: 'TextFont' },
	{ value: 'category', label: 'Category', icon: 'Folder01' },
];
