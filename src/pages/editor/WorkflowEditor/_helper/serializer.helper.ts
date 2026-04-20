import { Node, Edge } from '@xyflow/react';
import { IWorkflowNode, IWorkflowConnection } from '@/types/workflow.type';
import { ExpressionEngine, createExecutionContext } from '@/utils/expressionEngine.util';

export interface IEditorNodeData extends Record<string, unknown> {
	label: string;
	type: string;
	apiType?: string;
	parameters: Record<string, unknown>;
	isExecuting?: boolean;
	hasError?: boolean;
	executionData?: unknown;
}

export type IEditorNode = Node<IEditorNodeData>;

export interface IEditorEdge extends Omit<Edge, 'sourceHandle' | 'targetHandle'> {
	sourceHandle?: string | null;
	targetHandle?: string | null;
	animated?: boolean;
}

// Map API node types (e.g., "trigger.manual", "action.http") to frontend types
// Based on WORKFLOW_API.md node types reference
const API_TYPE_TO_EDITOR_TYPE: Record<string, string> = {
	// Triggers
	'trigger.manual': 'manual',
	'trigger.webhook': 'webhook',
	'trigger.schedule': 'schedule',
	'trigger.error': 'errorTrigger',
	// Actions
	'action.http': 'httpRequest',
	'action.code': 'code',
	'action.function': 'function',
	'action.transform': 'transform',
	'transform.string': 'transform', // Added mapping for transform.string
	'action.set': 'set',
	'action.respond': 'respond',
	'action.respondWebhook': 'respondWebhook',
	'action.respond_to_webhook': 'respondWebhook',
	'action.send_email': 'sendEmail',
	'action.email': 'sendEmail',
	'action.stopError': 'stopError',
	'action.sub_workflow': 'subWorkflow',
	'action.execute_workflow': 'executeWorkflow',
	// Logic
	'logic.condition': 'if',
	'logic.switch': 'switch',
	'logic.merge': 'merge',
	'logic.loop': 'loop',
	'logic.wait': 'wait',
	'logic.filter': 'filter',
	'logic.sort': 'sort',
	'logic.limit': 'limit',
	'logic.unique': 'unique',
	'logic.splitBatches': 'splitBatches',
	'logic.aggregate': 'aggregate',
	'logic.noop': 'noOp',
	'logic.dataFilter': 'dataFilter',
	'logic.dataSort': 'dataSort',
	'logic.dataLimit': 'dataLimit',
	'logic.remove_duplicates': 'removeDuplicates',
	'logic.datetime': 'datetime',
	'logic.expression': 'expression',
	'logic.math': 'math',
	'logic.crypto': 'crypto',
	'logic.xml': 'xml',
	'logic.json_transform': 'jsonTransform',
	'logic.splitData': 'splitData',
	'logic.mergeData': 'mergeData',
	'logic.html_extract': 'htmlExtract',
	// Error Handling
	'logic.try_catch': 'tryCatch',
	'logic.retry': 'retry',
	'logic.throw_error': 'throwError',
	'logic.continue_on_fail': 'continueOnFail',
	'logic.timeout': 'timeout',
	'logic.fallback': 'fallback',
	// AI & ML
	'ai.embeddings': 'aiEmbeddings',
	'ai.agent': 'aiAgent',
	'ai.generate': 'aiGenerate',
	'ai.chat': 'aiChat',
	'ai.image': 'aiImage',
	'ai.vision': 'aiVision',
	'ai.speech': 'aiSpeech',
	'ai.structured': 'aiStructured',
	'ai.router': 'aiRouter',
	'ai.vector_store': 'aiVectorStore',

	// Integrations
	'integration.slack': 'slack',
	'integration.discord': 'discord',
	'integration.telegram': 'telegram',
	'integration.github': 'github',
	'integration.postgres': 'postgres',
	'integration.mysql': 'mysql',
	'integration.mongodb': 'mongodb',
	'integration.redis': 'redis',
	'integration.email': 'email',
	'integration.openai': 'openai',
	'integration.anthropic': 'anthropic',
	'integration.google_sheets': 'googleSheets',
	'integration.stripe': 'stripe',
	'integration.aws_s3': 'awsS3',
	'integration.google_drive': 'googleDrive',
	'integration.twilio': 'twilio',
	'integration.sendgrid': 'sendgrid',
	'integration.jira': 'jira',
	'integration.salesforce': 'salesforce',
	'integration.airtable': 'airtable',
	'integration.notion': 'notion',
	'integration.graphql': 'graphql',
	'integration.ftp': 'ftp',
	'integration.sftp': 'sftp',
	'integration.hubspot': 'hubspot',
};

// Map frontend types back to API types
const EDITOR_TYPE_TO_API_TYPE: Record<string, string> = {
	// Triggers
	manual: 'trigger.manual',
	webhook: 'trigger.webhook',
	schedule: 'trigger.schedule',
	errorTrigger: 'trigger.error',
	// Actions
	httpRequest: 'action.http',
	code: 'action.code',
	function: 'action.function',
	transform: 'action.transform',
	set: 'action.set',
	respond: 'action.respond',
	respondWebhook: 'action.respond_to_webhook',
	sendEmail: 'action.send_email',
	stopError: 'action.stopError',
	subWorkflow: 'action.sub_workflow',
	executeWorkflow: 'action.execute_workflow',
	// Logic
	if: 'logic.condition',
	switch: 'logic.switch',
	merge: 'logic.merge',
	loop: 'logic.loop',
	wait: 'logic.wait',
	filter: 'logic.filter',
	sort: 'logic.sort',
	limit: 'logic.limit',
	unique: 'logic.unique',
	splitBatches: 'logic.splitBatches',
	aggregate: 'logic.aggregate',
	noOp: 'logic.noop',
	dataFilter: 'logic.dataFilter',
	dataSort: 'logic.dataSort',
	dataLimit: 'logic.dataLimit',
	removeDuplicates: 'logic.remove_duplicates',
	datetime: 'logic.datetime',
	expression: 'logic.expression',
	math: 'logic.math',
	crypto: 'logic.crypto',
	xml: 'logic.xml',
	jsonTransform: 'logic.json_transform',
	splitData: 'logic.splitData',
	mergeData: 'logic.mergeData',
	htmlExtract: 'logic.html_extract',
	// Error Handling
	tryCatch: 'logic.try_catch',
	retry: 'logic.retry',
	throwError: 'logic.throw_error',
	continueOnFail: 'logic.continue_on_fail',
	timeout: 'logic.timeout',
	fallback: 'logic.fallback',
	// AI & ML
	aiEmbeddings: 'ai.embeddings',
	aiAgent: 'ai.agent',
	aiGenerate: 'ai.generate',
	aiChat: 'ai.chat',
	aiImage: 'ai.image',
	aiVision: 'ai.vision',
	aiSpeech: 'ai.speech',
	aiStructured: 'ai.structured',
	aiRouter: 'ai.router',
	aiVectorStore: 'ai.vector_store',

	// Integrations
	slack: 'integration.slack',
	discord: 'integration.discord',
	telegram: 'integration.telegram',
	github: 'integration.github',
	postgres: 'integration.postgres',
	mysql: 'integration.mysql',
	mongodb: 'integration.mongodb',
	redis: 'integration.redis',
	email: 'integration.email',
	openai: 'integration.openai',
	anthropic: 'integration.anthropic',
	googleSheets: 'integration.google_sheets',
	stripe: 'integration.stripe',
	awsS3: 'integration.aws_s3',
	googleDrive: 'integration.google_drive',
	twilio: 'integration.twilio',
	sendgrid: 'integration.sendgrid',
	jira: 'integration.jira',
	salesforce: 'integration.salesforce',
	airtable: 'integration.airtable',
	notion: 'integration.notion',
	graphql: 'integration.graphql',
	ftp: 'integration.ftp',
	sftp: 'integration.sftp',
	hubspot: 'integration.hubspot',
};

const mapApiTypeToEditorType = (apiType: string): string => {
	return API_TYPE_TO_EDITOR_TYPE[apiType] || apiType;
};

const mapEditorTypeToApiType = (editorType: string): string => {
	return EDITOR_TYPE_TO_API_TYPE[editorType] || editorType;
};

export const workflowNodesToEditorNodes = (nodes: IWorkflowNode[]): IEditorNode[] => {
	return nodes.map((node) => {
		const editorType = mapApiTypeToEditorType(node.type);
		return {
			id: node.id,
			type: editorType,
			position: node.position || { x: 0, y: 0 },
			data: {
				label: node.name,
				type: editorType,
				apiType: node.type,
				parameters: node.parameters,
			},
			style: { background: 'transparent', border: 'none', width: 'auto' },
		};
	});
};

export const workflowConnectionsToEditorEdges = (
	connections: IWorkflowConnection[],
): IEditorEdge[] => {
	return connections
		.filter((conn) => conn?.source_node_id && conn?.target_node_id)
		.map((conn, index) => ({
			id: conn.id || `edge-${index}-${conn.source_node_id}-${conn.target_node_id}`,
			source: conn.source_node_id,
			target: conn.target_node_id,
			sourceHandle: conn.source_handle ?? null,
			targetHandle: conn.target_handle ?? null,
			type: 'custom',
			animated: false,
		}));
};

// Node types that should NOT be sent to the workflow API (visual-only nodes)
const VISUAL_ONLY_NODE_TYPES = ['stickyNote', 'addNode', 'group'];

export const editorNodesToWorkflowNodes = (nodes: IEditorNode[]): IWorkflowNode[] => {
	// Filter out visual-only nodes (sticky notes, add nodes, groups)
	return nodes
		.filter((node) => !VISUAL_ONLY_NODE_TYPES.includes(node.type || ''))
		.map((node) => {
			// Evaluate expressions in parameters before sending to API
			const evaluatedParameters = evaluateNodeExpressions(node);

			return {
				id: node.id,
				type: node.data.apiType || mapEditorTypeToApiType(node.data.type),
				name: node.data.label,
				position: { x: node.position.x, y: node.position.y },
				parameters: evaluatedParameters,
			};
		});
};

export const editorEdgesToWorkflowConnections = (edges: IEditorEdge[]): IWorkflowConnection[] => {
	return edges.map((edge, index) => ({
		id: edge.id || `conn_${index + 1}`,
		source_node_id: edge.source,
		target_node_id: edge.target,
		source_handle: edge.sourceHandle ?? undefined,
		target_handle: edge.targetHandle ?? undefined,
	}));
};

export const generateNodeId = (): string => {
	return `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
};

export interface IHistoryState {
	nodes: IEditorNode[];
	edges: IEditorEdge[];
}

export class HistoryManager {
	private history: IHistoryState[] = [];
	private currentIndex = -1;
	private maxSize = 50;

	push(state: IHistoryState) {
		if (this.currentIndex < this.history.length - 1) {
			this.history = this.history.slice(0, this.currentIndex + 1);
		}
		this.history.push(JSON.parse(JSON.stringify(state)));
		if (this.history.length > this.maxSize) {
			this.history.shift();
		} else {
			this.currentIndex++;
		}
	}

	undo(): IHistoryState | null {
		if (this.currentIndex > 0) {
			this.currentIndex--;
			return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
		}
		return null;
	}

	redo(): IHistoryState | null {
		if (this.currentIndex < this.history.length - 1) {
			this.currentIndex++;
			return JSON.parse(JSON.stringify(this.history[this.currentIndex]));
		}
		return null;
	}

	canUndo(): boolean {
		return this.currentIndex > 0;
	}

	canRedo(): boolean {
		return this.currentIndex < this.history.length - 1;
	}

	clear() {
		this.history = [];
		this.currentIndex = -1;
	}
}

/**
 * Evaluates expressions in node parameters before sending to API
 */
export const evaluateNodeExpressions = (node: IEditorNode): Record<string, unknown> => {
	const parameters = { ...node.data.parameters };

	// Recursively traverse parameters to find and evaluate expressions
	const evaluateExpressionsRecursively = (obj: any): any => {
		if (typeof obj === 'string' && obj.includes('{{') && obj.includes('}}')) {
			// This is a simplified expression evaluation - in a real implementation,
			// you would need to pass the proper execution context
			try {
				// For now, just return the raw expression since we don't have execution context
				// In a real scenario, you'd evaluate it with proper context
				return obj;
			} catch (error) {
				console.warn('Expression evaluation failed:', error);
				return obj;
			}
		} else if (Array.isArray(obj)) {
			return obj.map((item) => evaluateExpressionsRecursively(item));
		} else if (typeof obj === 'object' && obj !== null) {
			const result: any = {};
			for (const [key, value] of Object.entries(obj)) {
				result[key] = evaluateExpressionsRecursively(value);
			}
			return result;
		}
		return obj;
	};

	return evaluateExpressionsRecursively(parameters);
};
