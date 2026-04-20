import { useEffect, useRef, useCallback } from 'react';

interface IWebSocketOptions {
	onMessage?: (data: unknown) => void;
	onError?: (event: Event) => void;
	onOpen?: () => void;
	onClose?: () => void;
	reconnect?: boolean;
	reconnectDelay?: number;
}

/**
 * useWebSocket
 * Manages a WebSocket connection with optional auto-reconnect.
 * Follows the target project hook pattern (src/hooks/).
 */
const useWebSocket = (url: string, options: IWebSocketOptions = {}) => {
	const {
		onMessage,
		onError,
		onOpen,
		onClose,
		reconnect = true,
		reconnectDelay = 3000,
	} = options;

	const wsRef = useRef<WebSocket | null>(null);
	const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
	const isMountedRef = useRef(true);

	const onMessageRef = useRef(onMessage);
	const onErrorRef = useRef(onError);
	const onOpenRef = useRef(onOpen);
	const onCloseRef = useRef(onClose);

	useEffect(() => {
		onMessageRef.current = onMessage;
		onErrorRef.current = onError;
		onOpenRef.current = onOpen;
		onCloseRef.current = onClose;
	});

	const connect = useCallback(() => {
		if (!url || !isMountedRef.current) return;

		try {
			const ws = new WebSocket(url);
			wsRef.current = ws;

			ws.onopen = () => {
				onOpenRef.current?.();
			};

			ws.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					onMessageRef.current?.(data);
				} catch {
					onMessageRef.current?.(event.data);
				}
			};

			ws.onerror = (event) => {
				onErrorRef.current?.(event);
			};

			ws.onclose = () => {
				onCloseRef.current?.();
				if (reconnect && isMountedRef.current) {
					reconnectTimeoutRef.current = setTimeout(connect, reconnectDelay);
				}
			};
		} catch {
			// WebSocket URL invalid or connection failed — silently skip
		}
	}, [url, reconnect, reconnectDelay]);

	useEffect(() => {
		isMountedRef.current = true;
		connect();

		return () => {
			isMountedRef.current = false;
			if (reconnectTimeoutRef.current) clearTimeout(reconnectTimeoutRef.current);
			wsRef.current?.close();
		};
	}, [connect]);

	const send = useCallback((data: unknown) => {
		if (wsRef.current?.readyState === WebSocket.OPEN) {
			wsRef.current.send(JSON.stringify(data));
		}
	}, []);

	return { send };
};

export default useWebSocket;
