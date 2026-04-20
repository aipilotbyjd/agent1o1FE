/**
 * Node validation utility for workflow editor
 * Validates node configurations and provides error feedback
 */

import { IEditorNodeData } from './_helper/serializer.helper';
import { INodeTypeDefinition } from './_helper/nodeTypes.helper';
import { INodeParameter } from './_helper/nodeTypes.helper';

export interface INodeValidationError {
	field: string;
	message: string;
	severity: 'error' | 'warning';
}

export interface INodeValidationResult {
	isValid: boolean;
	errors: INodeValidationError[];
}

/**
 * Validates a node's configuration based on its definition
 */
export const validateNode = (
	nodeData: IEditorNodeData,
	nodeDefinition: INodeTypeDefinition,
): INodeValidationResult => {
	const errors: INodeValidationError[] = [];

	// Check required parameters
	const requiredParams = nodeDefinition.parameters.filter((param) => param.required);

	for (const param of requiredParams) {
		const value = nodeData.parameters[param.name];

		if (value === undefined || value === null || value === '') {
			errors.push({
				field: param.name,
				message: `${param.label || param.name} is required`,
				severity: 'error',
			});
		} else if (
			param.type === 'string' &&
			typeof value === 'string' &&
			param.name.includes('url') &&
			!isValidUrl(value)
		) {
			errors.push({
				field: param.name,
				message: 'Please enter a valid URL',
				severity: 'error',
			});
		} else if (param.type === 'number' && typeof value === 'number' && isNaN(value)) {
			errors.push({
				field: param.name,
				message: 'Please enter a valid number',
				severity: 'error',
			});
		}
	}

	// Check for expression validity if the parameter is an expression type
	for (const param of nodeDefinition.parameters) {
		const value = nodeData.parameters[param.name];
		if (param.type === 'expression' && typeof value === 'string') {
			if (value.includes('{{') && value.includes('}}')) {
				// Basic syntax check - in a real implementation, you'd validate the expression syntax
				if (!isValidExpressionSyntax(value)) {
					errors.push({
						field: param.name,
						message: 'Invalid expression syntax',
						severity: 'error',
					});
				}
			}
		}
	}

	// Check for credential requirements
	if (nodeDefinition.credentials && nodeDefinition.credentials.length > 0) {
		const hasCredentials = nodeDefinition.credentials.some((credType) =>
			hasCredentialOfType(nodeData, credType),
		);

		if (!hasCredentials) {
			errors.push({
				field: 'credentials',
				message: 'This node requires credentials',
				severity: 'warning',
			});
		}
	}

	return {
		isValid: errors.length === 0,
		errors,
	};
};

/**
 * Checks if a node has credentials of a specific type
 */
const hasCredentialOfType = (nodeData: IEditorNodeData, credentialType: string): boolean => {
	// Look for credential parameters in the node's parameters
	for (const [paramName, paramValue] of Object.entries(nodeData.parameters)) {
		// In a real implementation, you'd check if this parameter is a credential
		// For now, we'll just check if the parameter name contains 'credential' or 'auth'
		if (
			paramName.toLowerCase().includes('credential') ||
			paramName.toLowerCase().includes('auth')
		) {
			if (paramValue && typeof paramValue === 'string') {
				return true;
			}
		}
	}
	return false;
};

/**
 * Basic URL validation
 */
const isValidUrl = (url: string): boolean => {
	try {
		new URL(url);
		return true;
	} catch {
		return false;
	}
};

/**
 * Basic expression syntax validation
 */
const isValidExpressionSyntax = (expression: string): boolean => {
	// Count opening and closing braces
	const openBraces = (expression.match(/\{\{/g) || []).length;
	const closeBraces = (expression.match(/\}\}/g) || []).length;

	if (openBraces !== closeBraces) {
		return false;
	}

	// Check for proper nesting (simple check)
	let braceLevel = 0;
	for (let i = 0; i < expression.length; i++) {
		if (expression.substring(i, i + 2) === '{{') {
			braceLevel++;
			i++; // Skip next character
		} else if (expression.substring(i, i + 2) === '}}') {
			braceLevel--;
			i++; // Skip next character
			if (braceLevel < 0) {
				return false; // Closing brace before opening
			}
		}
	}

	return braceLevel === 0;
};

/**
 * Gets validation status for a node
 */
export const getNodeValidationStatus = (
	nodeData: IEditorNodeData,
	nodeDefinition: INodeTypeDefinition,
): 'valid' | 'invalid' | 'warning' => {
	const result = validateNode(nodeData, nodeDefinition);

	if (result.errors.some((err) => err.severity === 'error')) {
		return 'invalid';
	}

	if (result.errors.some((err) => err.severity === 'warning')) {
		return 'warning';
	}

	return 'valid';
};
