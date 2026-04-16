import { FC, HTMLAttributes, ReactNode } from 'react';
import classNames from 'classnames';
import { TColors } from '@/types/colors.type';
import themeConfig from '@/config/theme.config';
import { TBorderWidth } from '@/types/borderWidth.type';
import { TRounded } from '@/types/rounded.type';

// @start-snippet:: interface
export type TBadgeVariants = 'solid' | 'outline' | 'default' | 'soft';
// @end-snippet:: interface

// @start-snippet:: interface
interface IBadgeProps extends HTMLAttributes<HTMLSpanElement> {
	borderWidth?: TBorderWidth;
	children: ReactNode;
	className?: string;
	color?: TColors;
	rounded?: TRounded;
	variant?: TBadgeVariants;
}
// @end-snippet:: interface
const Badge: FC<IBadgeProps> = (props) => {
	const {
		borderWidth = 'border',
		children,
		className,
		color = themeConfig.themeColor,
		rounded = themeConfig.rounded,
		variant = 'default',
		...rest
	} = props;

	const badgeVariant: Record<TBadgeVariants, Record<TColors, string>> = {
		solid: {
			primary: 'bg-primary-500 border-transparent text-zinc-800',
			secondary: 'bg-secondary-500 border-transparent text-zinc-800 dark:text-zinc-200',
			zinc: 'bg-zinc-700 border-transparent text-white dark:bg-zinc-500 dark:text-zinc-200',
			red: 'bg-red-500 border-transparent text-zinc-800 dark:text-zinc-200',
			amber: 'bg-amber-500 border-transparent text-zinc-800 dark:text-zinc-200',
			lime: 'bg-lime-500 border-transparent text-zinc-800 dark:text-zinc-200',
			emerald: 'bg-emerald-500 border-transparent text-zinc-800 dark:text-zinc-200',
			sky: 'bg-sky-500 border-transparent text-zinc-800 dark:text-zinc-200',
			blue: 'bg-blue-500 border-transparent text-zinc-800 dark:text-zinc-200',
			violet: 'bg-violet-500 border-transparent text-zinc-800 dark:text-zinc-200',
		},
		outline: {
			primary: 'border-primary-500 bg-primary-500/10 text-primary-700 dark:text-primary-400',
			secondary: 'border-secondary-500 bg-secondary-500/10 text-secondary-700 dark:text-secondary-400',
			zinc: 'border-zinc-400 bg-zinc-500/10 text-zinc-700 dark:border-zinc-500 dark:text-zinc-400',
			red: 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-400',
			amber: 'border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400',
			lime: 'border-lime-500 bg-lime-500/10 text-lime-700 dark:text-lime-400',
			emerald: 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400',
			sky: 'border-sky-500 bg-sky-500/10 text-sky-700 dark:text-sky-400',
			blue: 'border-blue-500 bg-blue-500/10 text-blue-700 dark:text-blue-400',
			violet: 'border-violet-500 bg-violet-500/10 text-violet-700 dark:text-violet-400',
		},
		default: {
			primary: 'text-primary-500 border-transparent',
			secondary: 'text-secondary-500 border-transparent',
			zinc: 'text-zinc-500 border-transparent',
			red: 'text-red-500 border-transparent',
			amber: 'text-amber-500 border-transparent',
			lime: 'text-lime-500 border-transparent',
			emerald: 'text-emerald-500 border-transparent',
			sky: 'text-sky-500 border-transparent',
			blue: 'text-blue-500 border-transparent',
			violet: 'text-violet-500 border-transparent',
		},
		soft: {
			primary: 'text-primary-500 bg-primary-500/10 border-transparent',
			secondary: 'text-secondary-500 bg-secondary-500/10 border-transparent',
			zinc: 'text-zinc-500 bg-zinc-500/10 border-transparent',
			red: 'text-red-500 bg-red-500/10 border-transparent',
			amber: 'text-amber-500 bg-amber-500/10 border-transparent',
			lime: 'text-lime-500 bg-lime-500/10 border-transparent',
			emerald: 'text-emerald-500 bg-emerald-500/10 border-transparent',
			sky: 'text-sky-500 bg-sky-500/10 border-transparent',
			blue: 'text-blue-500 bg-blue-500/10 border-transparent',
			violet: 'text-violet-500 bg-violet-500/10 border-transparent',
		},
	};
	const badgeVariantClasses = badgeVariant[variant][color];

	const classes = classNames(
		'inline-flex items-center gap-x-1.5',
		'px-2',
		[`${borderWidth}`],
		[`${rounded}`],
		badgeVariantClasses,
		className,
	);

	return (
		<span data-component-name='Badge' className={classes} {...rest}>
			{children}
		</span>
	);
};
Badge.displayName = 'Badge';

export default Badge;
