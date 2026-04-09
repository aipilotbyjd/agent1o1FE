/**
 * Token Manager
 * Stores access_token, refresh_token, and expiry in localStorage or sessionStorage
 * based on remember-me preference.
 *
 * The Laravel backend returns { access_token, refresh_token, token_type, expires_in }.
 * Refresh endpoint requires refresh_token in the request body.
 */

const TOKEN_KEYS = {
	ACCESS_TOKEN: 'a1o1_access_token',
	REFRESH_TOKEN: 'a1o1_refresh_token',
	TOKEN_EXPIRY: 'a1o1_token_expiry',
	REMEMBER_ME: 'a1o1_remember_me',
} as const;

// Custom event for token changes (same-tab reactivity)
export const TOKEN_CHANGE_EVENT = 'a1o1_token_change';

const dispatchTokenChange = () => {
	window.dispatchEvent(new CustomEvent(TOKEN_CHANGE_EVENT));
};

// ─── Getters ─────────────────────────────────────────────────

export const getAccessToken = (): string | null => {
	return (
		localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN) ||
		sessionStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN)
	);
};

export const getRefreshToken = (): string | null => {
	return (
		localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN) ||
		sessionStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN)
	);
};

export const getTokenExpiry = (): number | null => {
	const expiry =
		localStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY) ||
		sessionStorage.getItem(TOKEN_KEYS.TOKEN_EXPIRY);
	return expiry ? parseInt(expiry, 10) : null;
};

export const isRememberMe = (): boolean => {
	return localStorage.getItem(TOKEN_KEYS.REMEMBER_ME) === 'true';
};

// ─── Setters ─────────────────────────────────────────────────

/**
 * Store the access token, refresh token, and computed expiry.
 * @param token - the access_token string
 * @param expiresIn - seconds until expiry (from backend `expires_in`)
 * @param rememberMe - persist in localStorage (true) or sessionStorage (false)
 * @param refreshToken - the refresh_token string (optional, keeps existing if not provided)
 */
export const setToken = (
	token: string,
	expiresIn: number,
	rememberMe: boolean = false,
	refreshToken?: string,
): void => {
	const storage = rememberMe ? localStorage : sessionStorage;

	// Clear both storages first
	clearTokensRaw();

	// Always store remember-me flag in localStorage
	localStorage.setItem(TOKEN_KEYS.REMEMBER_ME, String(rememberMe));

	// Store tokens + expiry
	storage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
	storage.setItem(TOKEN_KEYS.TOKEN_EXPIRY, String(Math.floor(Date.now() / 1000) + expiresIn));
	if (refreshToken) {
		storage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
	}

	dispatchTokenChange();
};

/** Clear without dispatching event (internal helper) */
const clearTokensRaw = (): void => {
	Object.values(TOKEN_KEYS).forEach((key) => {
		localStorage.removeItem(key);
		sessionStorage.removeItem(key);
	});
};

/** Clear all tokens and dispatch change event */
export const clearTokens = (): void => {
	clearTokensRaw();
	dispatchTokenChange();
};

// ─── Checks ──────────────────────────────────────────────────

export const isTokenExpired = (): boolean => {
	const expiry = getTokenExpiry();
	if (!expiry) return true;
	// 30-second buffer before actual expiry
	return Date.now() / 1000 > expiry - 30;
};

export const hasValidToken = (): boolean => {
	return !!getAccessToken() && !isTokenExpired();
};

// ─── Default export (backward compat) ───────────────────────

const TokenManager = {
	setToken,
	getToken: getAccessToken,
	removeToken: clearTokens,
};

export default TokenManager;
