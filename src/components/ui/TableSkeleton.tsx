import { FC } from 'react';
import Card, { CardBody, CardHeader, CardHeaderChild } from '@/components/ui/Card';
import Skeleton from '@/components/ui/Skeleton';

interface ITableSkeletonProps {
	rows?: number;
	columns?: number;
	showHeader?: boolean;
	showIcon?: boolean;
	showFooter?: boolean;
}

const TableSkeleton: FC<ITableSkeletonProps> = ({
	rows = 5,
	columns = 5,
	showHeader = true,
	showIcon = true,
	showFooter = true,
}) => {
	return (
		<Card className='h-full overflow-hidden'>
			{showHeader && (
				<CardHeader>
					<CardHeaderChild>
						<div className='flex items-center gap-3'>
							{showIcon && <Skeleton className='h-10 w-10 rounded-xl' />}
							<Skeleton className='h-6 w-32 rounded-lg' />
						</div>
					</CardHeaderChild>
					<CardHeaderChild>
						<Skeleton className='h-5 w-20 rounded-lg' />
					</CardHeaderChild>
				</CardHeader>
			)}
			<CardBody className='p-0'>
				{/* Table Header */}
				<div className='border-b border-zinc-200 bg-zinc-50/50 px-4 py-3 dark:border-zinc-700 dark:bg-zinc-800/30'>
					<div className='flex items-center gap-4'>
						{Array.from({ length: columns }).map((_, i) => (
							<Skeleton
								key={i}
								className={`h-4 rounded ${i === 0 ? 'w-40' : i === columns - 1 ? 'w-16' : 'w-24'}`}
							/>
						))}
					</div>
				</div>

				{/* Table Rows */}
				<div className='divide-y divide-zinc-100 dark:divide-zinc-800'>
					{Array.from({ length: rows }).map((_, rowIndex) => (
						<div
							key={rowIndex}
							className='flex items-center gap-4 px-4 py-4'
							style={{
								animationDelay: `${rowIndex * 100}ms`,
							}}>
							{/* First column with icon */}
							<div className='flex items-center gap-3'>
								<Skeleton className='h-10 w-10 rounded-lg' />
								<div className='space-y-2'>
									<Skeleton className='h-4 w-32 rounded' />
									<Skeleton className='h-3 w-24 rounded' />
								</div>
							</div>

							{/* Other columns */}
							{Array.from({ length: columns - 2 }).map((_, colIndex) => (
								<Skeleton
									key={colIndex}
									className={`h-4 rounded ${colIndex === 0 ? 'w-20' : 'w-16'}`}
								/>
							))}

							{/* Actions column */}
							<div className='ml-auto'>
								<Skeleton className='h-8 w-8 rounded-lg' />
							</div>
						</div>
					))}
				</div>
			</CardBody>

			{/* Footer */}
			{showFooter && (
				<div className='flex items-center justify-between border-t border-zinc-200 px-4 py-3 dark:border-zinc-700'>
					<Skeleton className='h-8 w-24 rounded-lg' />
					<div className='flex items-center gap-2'>
						<Skeleton className='h-8 w-8 rounded-lg' />
						<Skeleton className='h-8 w-8 rounded-lg' />
						<Skeleton className='h-8 w-20 rounded-lg' />
						<Skeleton className='h-8 w-8 rounded-lg' />
						<Skeleton className='h-8 w-8 rounded-lg' />
					</div>
				</div>
			)}
		</Card>
	);
};

// Stats cards skeleton
export const StatsCardsSkeleton: FC = () => {
	return (
		<div className='grid grid-cols-2 gap-4 lg:grid-cols-4'>
			{Array.from({ length: 4 }).map((_, i) => (
				<Card key={i} className='overflow-hidden'>
					<CardBody className='flex items-center gap-4'>
						<Skeleton className='h-12 w-12 rounded-xl' />
						<div className='space-y-2'>
							<Skeleton className='h-7 w-16 rounded' />
							<Skeleton className='h-4 w-24 rounded' />
						</div>
					</CardBody>
				</Card>
			))}
		</div>
	);
};

// Workflow specific skeleton with folders
export const WorkflowTableSkeleton: FC = () => {
	return (
		<Card className='h-full overflow-hidden'>
			<CardHeader>
				<CardHeaderChild>
					<div className='flex items-center gap-3'>
						<Skeleton className='h-10 w-10 rounded-xl' />
						<Skeleton className='h-6 w-28 rounded-lg' />
					</div>
				</CardHeaderChild>
				<CardHeaderChild>
					<Skeleton className='h-5 w-24 rounded-lg' />
				</CardHeaderChild>
			</CardHeader>
			<CardBody className='p-0'>
				{/* Folder rows */}
				{Array.from({ length: 3 }).map((_, folderIndex) => (
					<div key={folderIndex}>
						{/* Folder header */}
						<div className='flex items-center gap-3 border-b border-zinc-200 px-4 py-3 dark:border-zinc-700'>
							<Skeleton className='h-6 w-6 rounded' />
							<Skeleton className='h-8 w-8 rounded-lg' />
							<Skeleton className='h-5 w-32 rounded' />
							<Skeleton className='h-5 w-8 rounded-full' />
						</div>

						{/* Workflows in folder */}
						{Array.from({ length: 2 }).map((_, wfIndex) => (
							<div
								key={wfIndex}
								className='ml-7 flex items-center gap-3 border-b border-l-2 border-zinc-200 py-3 pr-4 pl-6 last:border-b-0 dark:border-zinc-700'>
								<Skeleton className='h-9 w-9 rounded-lg' />
								<div className='flex-1 space-y-2'>
									<Skeleton className='h-4 w-40 rounded' />
									<Skeleton className='h-3 w-24 rounded' />
								</div>
								<Skeleton className='h-6 w-16 rounded-full' />
								<Skeleton className='h-4 w-12 rounded' />
								<Skeleton className='h-4 w-16 rounded' />
								<Skeleton className='h-8 w-8 rounded-lg' />
							</div>
						))}
					</div>
				))}
			</CardBody>
		</Card>
	);
};

export default TableSkeleton;
