/**
 * API Error Parser
 * Matches the Laravel validation / error response shape:
 * { status, message, errors?: Record<string, string[]> }
 */

export interface ApiError {
	message: string;
	status?: number;
	errors?: Record<string, string[]>;
}

/**
 * Parse any thrown error into a consistent ApiError shape.
 * The axios interceptor already rejects with { status, message, errors }.
 */
export const parseApiError = (error: unknown): ApiError => {
	if (typeof error === 'object' && error !== null) {
		const err = error as Record<string, unknown>;
		return {
			message: (err.message as string) || 'An unexpected error occurred.',
			status: err.status as number | undefined,
			errors: err.errors as Record<string, string[]> | undefined,
		};
	}

	if (error instanceof Error) {
		return { message: error.message };
	}

	return { message: 'An unexpected error occurred.' };
};

/**
 * Get the first validation error message for a specific field.
 * Useful in forms: `getFieldError(error, 'email')` → "The email has already been taken."
 */
export const getFieldError = (error: ApiError | null, field: string): string | undefined => {
	return error?.errors?.[field]?.[0];
};

/**
 * Get all field errors as a flat map of field → first error message.
 * Useful for Formik setErrors().
 */
export const getFieldErrors = (error: ApiError | null): Record<string, string> => {
	if (!error?.errors) return {};
	const result: Record<string, string> = {};
	for (const [field, messages] of Object.entries(error.errors)) {
		if (messages.length > 0) {
			result[field] = messages[0];
		}
	}
	return result;
};
