import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/store/hooks';

export const useWebSocket = () => {
    const { user } = useAppSelector((state) => state.auth);
    const ws = useRef<WebSocket | null>(null);

    useEffect(() => {
        if (!user || ws.current) return;

        let isMounted = true;
        let reconnectTimeout: NodeJS.Timeout;

        const connect = () => {
            if (!isMounted) return;
            const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws';
            console.log(`[WS] Attempting to connect to ${wsUrl}/${user.id}`);
            const socket = new WebSocket(`${wsUrl}/${user.id}`);

            socket.onopen = () => {
                console.log(`[WS] Connection opened for user ${user.id}`);
                if (!isMounted) {
                    console.log(`[WS] Socket opened but component unmounted. Closing cleanly.`);
                    socket.close();
                }
            };

            socket.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    console.log(`[WS] Payload received:`, data);
                    window.dispatchEvent(new CustomEvent('ws_message', { detail: data }));
                } catch(e) {}
            };

            socket.onclose = (event) => {
                console.log(`[WS] Connection closed. Code: ${event.code}`);
                ws.current = null;
                if (isMounted) reconnectTimeout = setTimeout(connect, 3000);
            };

            ws.current = socket;
        };

        connect();

        return () => {
            isMounted = false;
            clearTimeout(reconnectTimeout);
            if (ws.current) {
                if (ws.current.readyState === WebSocket.OPEN) {
                    ws.current.close();
                }
                ws.current = null;
            }
        };
    }, [user]);
};

export const useWebSocketEvent = (eventType: string, callback: (payload?: any) => void) => {
    useEffect(() => {
        const handler = (e: any) => {
            if (e.detail?.type === eventType) callback(e.detail.payload);
        };
        window.addEventListener('ws_message', handler);
        return () => window.removeEventListener('ws_message', handler);
    }, [eventType, callback]);
};
