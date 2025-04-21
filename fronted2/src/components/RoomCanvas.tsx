'use client';

import { useEffect, useState } from 'react';
import { SOCKET_URL } from '../../config';
import { Canvas } from './Canvas';
import { useRouter } from 'next/navigation';




export default function RoomCanvas({ roomId }: { roomId: string }) {
    const [socket, setSocket] = useState<WebSocket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    // useEffect(() => {
    //     let ws: WebSocket | null = null;
    //     const connectWebSocket = () => {
    //         if (!roomId) {
    //             console.error('No roomId provided');
    //             return;
    //         }
    
    //         const token = localStorage.getItem('token');
    //         if (!token) {
    //             setError('No authentication token found. Please login.');
    //             router.push('/signin')
    //             return;
    //         }
    
    //         console.log('Connecting to WebSocket:', SOCKET_URL);
    //         console.log('Room ID:', roomId);
    //         console.log('Token:', token.substring(0, 10) + '...');
    
           
    //         const ws = new WebSocket(`${SOCKET_URL}?token=${token}&roomId=${roomId}`);
    
    //         ws.onopen = () => {
    //             console.log('WebSocket Connected Successfully');
    //             setSocket(ws);
    //             setIsConnected(true);
                
    //             // Join room
    //             ws.send(JSON.stringify({
    //                 type: 'join_room',
    //                 roomId: roomId
    //             }));
    //         };
    
    //         ws.onmessage = (event) => {
    //             console.log('Received message:', event.data);
    //             try {
    //                 const data = JSON.parse(event.data);
    //                 if (data.error) {
    //                     console.error('WebSocket error:', data.error);
    //                     setError(data.error);
    //                     return;
    //                 }
    //                 // Handle other message types...
    //             } catch (error) {
    //                 console.error('Error parsing message:', error);
    //             }
    //         };
    
    //         ws.onerror = (event) => {
    //             console.error('WebSocket Error:', event);
    //             setError('Failed to connect to server');
    //             setIsConnected(false);
    //         };
    
    //         ws.onclose = () => {
    //             console.log('WebSocket Disconnected');
    //             setIsConnected(false);
    //         };
    //     }

    //     connectWebSocket();

    //     return () => {
    //         if (ws && ws.readyState === WebSocket.OPEN) {
    //             ws.close();
    //         }
    //     };
    // }, [roomId , router]);


    useEffect(() => {
        let ws: WebSocket | null;
        
        const connectWebSocket = () => {
            if (!roomId) {
                console.error('No roomId provided');
                return;
            }
    
            const token = localStorage.getItem('token');
            if (!token) {
                setError('No authentication token found. Please login.');
                router.push('/signin')
                return;
            }
    
            console.log('Connecting to WebSocket:', SOCKET_URL);
            console.log('Room ID:', roomId);
            console.log('Token:', token.substring(0, 10) + '...');
    
            // Assign to the outer ws variable so it's accessible in the cleanup function
            ws = new WebSocket(`${SOCKET_URL}?token=${token}&roomId=${roomId}`);
    
            ws.onopen = () => {
                console.log('WebSocket Connected Successfully');
                setSocket(ws);
                setIsConnected(true);
                
                // Join room
                if (ws) {
                    ws.send(JSON.stringify({
                        type: 'join_room',
                        roomId: roomId
                    }));
                }
            };
    
            // Rest of the WebSocket event handlers...

            ws.onmessage = (event) => {
                            console.log('Received message:', event.data);
                            try {
                                const data = JSON.parse(event.data);
                                if (data.error) {
                                    console.error('WebSocket error:', data.error);
                                    setError(data.error);
                                    return;
                                }
                                // Handle other message types...
                            } catch (error) {
                                console.error('Error parsing message:', error);
                            }
                        };
                
                        ws.onerror = (event) => {
                            console.error('WebSocket Error:', event);
                            setError('Failed to connect to server');
                            setIsConnected(false);
                        };
                
                        ws.onclose = () => {
                            console.log('WebSocket Disconnected');
                            setIsConnected(false);
                        };
                //     }


        }
    
        connectWebSocket();
    
        return () => {
            if (ws && ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [roomId, router]);

    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!socket || !isConnected) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p>Connecting to server...</p>
            </div>
        );
    }

    return <Canvas roomId={roomId} socket={socket} />;
}

