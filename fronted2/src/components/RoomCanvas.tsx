'use client';

import React, { useEffect, useState } from 'react'
import { SOCKET_URL } from '../../config';
import { Canvas } from './Canvas';

export default function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (!roomId) return;

        const ws = new WebSocket(`${SOCKET_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTc0MzU4ODQ2NSwiZXhwIjoxNzQzNjc0ODY1fQ.4yvebQzCXYdzLmOUntrQjHy4IyFdlTagxGGHU5lnIX8`);

        ws.onopen = () => {
            console.log('WebSocket Connected');
            setSocket(ws);
            setIsConnected(true);
            
            // Send join room message
            ws.send(JSON.stringify({
                type: 'join-room',
                roomId
            }));
        };

        ws.onerror = (error) => {
            console.error('WebSocket Error:', error);
            setIsConnected(false);
        };

        ws.onclose = () => {
            console.log('WebSocket Disconnected');
            setIsConnected(false);
        };

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [roomId]);

    if (!socket || !isConnected) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <h1 className="text-xl font-semibold">Connecting to the server...</h1>
            </div>
        );
    }

    return (
        <div className="w-full h-full">
            <Canvas roomId={roomId} socket={socket} />
        </div>
    );
}

