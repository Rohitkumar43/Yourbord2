'use client';

import React, { useEffect, useRef } from 'react'
import { SOCKET_URL } from '../../config';
import {Canvas} from './Canvas';

export default function RoomCanvas({roomId}: {roomId: string}) {
    //const [loading, setLoading] = React.useState(true);
    const [socket , setSocket] = React.useState<WebSocket | null>(null);
    // for using canvas we have to take the ref of the canvas using the userRef hook

    useEffect(() => {
        if(!roomId) return;

        const ws = new WebSocket(`${SOCKET_URL}?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjQsImlhdCI6MTczOTk1NzcxOX0.OLYxBeoAeESYLlS4iO7pc0E7UIMBQ1buQ7tBj6FBKG4`);
// send a message to the server to join the room
        ws.onopen = () => {
            setSocket(ws);
            const data =  ws.send(JSON.stringify({
                type: 'join-room',
                roomId
            }));
            console.log(data)
        }
        return () => {
            ws.close();
        }

    }, [roomId]);



    if (!socket) {
        return <div>
            <h1>Connecting to the server ....</h1>
        </div>
        
    }

    return (
        <div>
            <Canvas roomId={roomId} socket={socket}/>
        </div>
    )

}

