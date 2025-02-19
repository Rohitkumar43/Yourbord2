'use client';

import { drawintial } from '@/drawElement';
import { Socket } from 'dgram';
import React, { useEffect, useRef } from 'react'
import { SOCKET_URL } from '../../config';

export default function RoomCanvas({roomId}: {roomId: string}) {
    //const [loading, setLoading] = React.useState(true);
    const [socket , setSocket] = React.useState<WebSocket | null>(null);
    // for using canvas we have to take the ref of the canvas using the userRef hook

    useEffect(() => {

        const ws = new WebSocket(`${SOCKET_URL}`);

        ws.onopen = () => {
            setSocket(ws);
        }

    }, []);



    if (!socket) {
        return <div>
            <h1>Connecting to the server ....</h1>
        </div>
        
    }

}

