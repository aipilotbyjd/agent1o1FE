/**
 * Expression Engine Utility
 * Evaluates n8n-style mustache expressions: {{ $json.field }}, {{ nodeName.json.field }}
 * Follows the target project util pattern (src/utils/*.util.ts).
 */

export interface IExpressionContext {
	$json: Record<string, unknown>;
	$input: {
		all: () => unknown[];
		first: () => unknown;
		last: () => unknown;
		item: () => unknown;
	};
	$env: Record<string, string>;
	$vars: Record<string, unknown>;
	$node: { name: string; type: string; [key: string]: unknown };
	[nodeName: string]: unknown;
}

export class ExpressionEngine {
	private context: IExpressionContext;

	constructor(context: IExpressionContext) {
		this.context = context;
	}

	evaluate(expression: string): unknown {
		const regex = /\{\{([^}]+)\}\}/g;
		let match;
		let result = expression;

		while ((match = regex.exec(expression)) !== null) {
			const fullMatch = match[0];
			const expr = match[1].trim();
			try {
				const evaluated = this.evaluateSingleExpression(expr);
				result = result.replace(fullMatch, String(evaluated));
			} catch {
				result = result.replace(fullMatch, fullMatch);
			}
		}

		const singleExpr = expression.match(/^\{\{([^}]+)\}\}$/);
		if (singleExpr) {
			try {
				return this.evaluateSingleExpression(singleExpr[1].trim());
			} catch {
				return expression;
			}
		}

		return result;
	}

	private evaluateSingleExpression(expr: string): unknown {
		const parts = expr.split('.');
		let current: unknown = this.context;

		for (const part of parts) {
			if (current === null || current === undefined) return undefined;
			if (part === 'first' && typeof (current as Record<string, unknown>).first === 'function') {
				return ((current as Record<string, unknown>).first as () => unknown)();
			}
			if (part === 'last' && typeof (current as Record<string, unknown>).last === 'function') {
				return ((current as Record<string, unknown>).last as () => unknown)();
			}
			if (part === 'all' && typeof (current as Record<string, unknown>).all === 'function') {
				return ((current as Record<string, unknown>).all as () => unknown)();
			}
			if (part === 'item' && typeof (current as Record<string, unknown>).item === 'function') {
				return ((current as Record<string, unknown>).item as () => unknown)();
			}
			current = (current as Record<string, unknown>)[part];
		}

		return current;
	}

	static evaluateExpression(expression: string, context: IExpressionContext): unknown {
		return new ExpressionEngine(context).evaluate(expression);
	}

	static getAutocompleteSuggestions(context: IExpressionContext): string[] {
		const suggestions: string[] = [];
		Object.keys(context).forEach((key) => suggestions.push(key));
		if (context.$json) Object.keys(context.$json).forEach((k) => suggestions.push(`$json.${k}`));
		if (context.$env) Object.keys(context.$env).forEach((k) => suggestions.push(`$env.${k}`));
		if (context.$vars) Object.keys(context.$vars).forEach((k) => suggestions.push(`$vars.${k}`));
		if (context.$input) {
			suggestions.push('$input.first()', '$input.last()', '$input.all()', '$input.item()');
		}
		return suggestions;
	}
}

export const createExecutionContext = (
	currentNodeData: unknown,
	previousNodeOutputs: Record<string, unknown>,
	environmentVars: Record<string, string> = {},
	workflowVars: Record<string, unknown> = {},
): IExpressionContext => {
	const context: IExpressionContext = {
		$json: (currentNodeData as Record<string, unknown>) || {},
		$input: {
			all: () => [currentNodeData],
			first: () => currentNodeData,
			last: () => currentNodeData,
			item: () => currentNodeData,
		},
		$env: environmentVars,
		$vars: workflowVars,
		$node: { name: 'currentNode', type: 'unknown' },
	};

	Object.entries(previousNodeOutputs).forEach(([nodeName, output]) => {
		context[nodeName] = { json: output };
	});

	return context;
};

/** Derive a WebSocket base URL from VITE_API_URL */
export const getWebSocketUrl = (): string => {
	const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8090/api/v1';
	const url = new URL(apiUrl);
	const protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
	const pathname = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname;
	return `${protocol}//${url.host}${pathname}/ws`;
};
