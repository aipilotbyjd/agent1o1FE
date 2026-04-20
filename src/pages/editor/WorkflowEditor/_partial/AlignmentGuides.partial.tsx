import { FC, memo } from 'react';

export interface IAlignmentGuide {
	type: 'horizontal' | 'vertical';
	position: number;
}

interface IAlignmentGuidesPartialProps {
	guides: IAlignmentGuide[];
	viewportWidth: number;
	viewportHeight: number;
}

const AlignmentGuidesPartial: FC<IAlignmentGuidesPartialProps> = ({
	guides,
	viewportWidth,
	viewportHeight,
}) => {
	if (guides.length === 0) return null;

	return (
		<svg
			className='pointer-events-none absolute inset-0 z-50'
			style={{ width: viewportWidth, height: viewportHeight }}>
			{guides.map((guide, index) => {
				if (guide.type === 'horizontal') {
					return (
						<line
							key={`h-${index}`}
							x1={0}
							y1={guide.position}
							x2={viewportWidth}
							y2={guide.position}
							stroke='#3b82f6'
							strokeWidth={1}
							strokeDasharray='4 4'
						/>
					);
				}
				return (
					<line
						key={`v-${index}`}
						x1={guide.position}
						y1={0}
						x2={guide.position}
						y2={viewportHeight}
						stroke='#3b82f6'
						strokeWidth={1}
						strokeDasharray='4 4'
					/>
				);
			})}
		</svg>
	);
};

export default memo(AlignmentGuidesPartial);

// Helper function to calculate alignment guides
export const calculateAlignmentGuides = (
	draggingNodeId: string,
	draggingNodePosition: { x: number; y: number },
	draggingNodeSize: { width: number; height: number },
	allNodes: { id: string; position: { x: number; y: number }; width?: number; height?: number }[],
	threshold: number = 5,
): { guides: IAlignmentGuide[]; snappedPosition: { x: number; y: number } } => {
	const guides: IAlignmentGuide[] = [];
	let snappedX = draggingNodePosition.x;
	let snappedY = draggingNodePosition.y;

	const draggingCenterX = draggingNodePosition.x + draggingNodeSize.width / 2;
	const draggingCenterY = draggingNodePosition.y + draggingNodeSize.height / 2;
	const draggingRight = draggingNodePosition.x + draggingNodeSize.width;
	const draggingBottom = draggingNodePosition.y + draggingNodeSize.height;

	for (const node of allNodes) {
		if (node.id === draggingNodeId) continue;

		const nodeWidth = node.width || 100;
		const nodeHeight = node.height || 100;
		const nodeCenterX = node.position.x + nodeWidth / 2;
		const nodeCenterY = node.position.y + nodeHeight / 2;
		const nodeRight = node.position.x + nodeWidth;
		const nodeBottom = node.position.y + nodeHeight;

		// Horizontal alignment (Y axis)
		// Top to Top
		if (Math.abs(draggingNodePosition.y - node.position.y) < threshold) {
			guides.push({ type: 'horizontal', position: node.position.y });
			snappedY = node.position.y;
		}
		// Center to Center (Y)
		if (Math.abs(draggingCenterY - nodeCenterY) < threshold) {
			guides.push({ type: 'horizontal', position: nodeCenterY });
			snappedY = nodeCenterY - draggingNodeSize.height / 2;
		}
		// Bottom to Bottom
		if (Math.abs(draggingBottom - nodeBottom) < threshold) {
			guides.push({ type: 'horizontal', position: nodeBottom });
			snappedY = nodeBottom - draggingNodeSize.height;
		}
		// Top to Bottom
		if (Math.abs(draggingNodePosition.y - nodeBottom) < threshold) {
			guides.push({ type: 'horizontal', position: nodeBottom });
			snappedY = nodeBottom;
		}
		// Bottom to Top
		if (Math.abs(draggingBottom - node.position.y) < threshold) {
			guides.push({ type: 'horizontal', position: node.position.y });
			snappedY = node.position.y - draggingNodeSize.height;
		}

		// Vertical alignment (X axis)
		// Left to Left
		if (Math.abs(draggingNodePosition.x - node.position.x) < threshold) {
			guides.push({ type: 'vertical', position: node.position.x });
			snappedX = node.position.x;
		}
		// Center to Center (X)
		if (Math.abs(draggingCenterX - nodeCenterX) < threshold) {
			guides.push({ type: 'vertical', position: nodeCenterX });
			snappedX = nodeCenterX - draggingNodeSize.width / 2;
		}
		// Right to Right
		if (Math.abs(draggingRight - nodeRight) < threshold) {
			guides.push({ type: 'vertical', position: nodeRight });
			snappedX = nodeRight - draggingNodeSize.width;
		}
		// Left to Right
		if (Math.abs(draggingNodePosition.x - nodeRight) < threshold) {
			guides.push({ type: 'vertical', position: nodeRight });
			snappedX = nodeRight;
		}
		// Right to Left
		if (Math.abs(draggingRight - node.position.x) < threshold) {
			guides.push({ type: 'vertical', position: node.position.x });
			snappedX = node.position.x - draggingNodeSize.width;
		}
	}

	// Remove duplicate guides
	const uniqueGuides = guides.filter(
		(guide, index, self) =>
			index ===
			self.findIndex(
				(g) => g.type === guide.type && Math.abs(g.position - guide.position) < 1,
			),
	);

	return { guides: uniqueGuides, snappedPosition: { x: snappedX, y: snappedY } };
};
