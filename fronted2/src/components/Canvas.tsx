

// import { drawintial } from '@/drawElement';
// import React, { useEffect, useRef } from 'react'

// export function Canvas({roomId , socket}: 
//     {
//         roomId: string
//         socket: WebSocket
//     }) {
//     // for using canvas we have to take the ref of the canvas using the userRef hook

//     const Canvasref = useRef<HTMLCanvasElement>(null);


//     // useeffect to change the context while the component is mounted using the ref
    
//         useEffect(() => {
//             if (Canvasref.current) {
//                 //const canvas =  Canvasref.current;
//                 drawintial(Canvasref.current , roomId , socket);
//             }
//         } , [Canvasref]);
    



//         return (
//             <div>
//               <canvas height={1500} width={1500}  ref={Canvasref} ></canvas>
//               <div className="absolute bottom-0 right-0 p-4 justify-center items-center flex flex-col">
//                 <div className="m-2 p-2">
//                     <button className="bg-blue-500 text-white p-3 rounded-lg">React</button>
//                 </div>
//                 <div className="m-2 p-2">
//                     <button className="bg-blue-500 text-white p-3 rounded-lg">Circle</button>
//                 </div>
        
//               </div>
//             </div>
//           );
// }

// export default Canvas



'use client';

import { useEffect, useRef } from 'react';
import { drawintial } from '../drawElement';

interface CanvasProps {
    roomId: string;
    socket: WebSocket;
}

export function Canvas({ roomId, socket }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !roomId) {
            console.error('Canvas or roomId not available');
            return;
        }

        console.log('Initializing canvas for room:', roomId);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
            console.error('Could not get canvas context');
            return;
        }

        // Initialize drawing
        drawintial(canvas, roomId, socket).catch(error => {
            console.error('Error initializing drawing:', error);
        });

    }, [roomId, socket]);

    return (
        // to make the scrolling disable horizonal and vertical both 
        <canvas style={
            {
                height: '100vh',
                background: 'red',
                overflow: 'hidden'
            }
        }
            ref={canvasRef} width={window.innerWidth} height={window.innerHeight}
            className="w-full h-full border border-gray-300"
        />
    );
}
