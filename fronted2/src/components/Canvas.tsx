

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

import { useEffect, useRef, useState } from 'react';
import { drawintial } from '../drawElement';
import { IconButton } from './IconButton';
import { Circle, Pencil, RectangleHorizontal } from 'lucide-react';
import { canvasClass } from '@/drawElement/canvasClass';

interface CanvasProps {
    roomId: string;
    socket: WebSocket;
}

// enum - type of the tool 
export type Tool = "pencil" | "circle" | "react";

export function Canvas({ roomId, socket }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canVasClass , setcanVasClass] = useState<canvasClass>();
    
    const [selectedTool , setIsselected] = useState<Tool>('circle')


    useEffect(() => {
        canVasClass?.setShape(selectedTool);
    }, [selectedTool , canVasClass])

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !roomId) {
            console.error('Canvas or roomId not available');
            return;
        }

        const g = new canvasClass(canvas, roomId, socket);
        setcanVasClass(g);

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

    }, [roomId, socket ]);

    return (
        // to make the scrolling disable horizonal and vertical both 
       <div>
         <canvas style={
            {
                height: '100vh',
                background: 'black',
                overflow: 'hidden'
            }
        }
            ref={canvasRef} width={window.innerWidth} height={window.innerHeight}
            className="w-full h-full border border-gray-300"
        >
            </canvas>
       <UppertoolBox setIsselected={setIsselected} selectedTool={selectedTool}/>
       </div>
    );
}




export function UppertoolBox({
    selectedTool ,
    setIsselected 
}: {
    selectedTool: Tool,
    setIsselected: (s: Tool) => void;
}) {
    //const [activated , setIsactivated] = useState()<boolean>
    return (
        <div style={
            {
                position: 'fixed',
                top: 10,
                left: 15
            }
        }>
            <div className='flex gap-2'>
                <IconButton activated={selectedTool === "pencil"} icon={<Pencil />}
                 onclick={() => { 
                    setIsselected("pencil");
                 }}>
                 </IconButton>

                <IconButton 
                activated={selectedTool === "react"} 
                icon={<RectangleHorizontal />} 
                onclick={() => {
                    setIsselected("react")
                }}>
                </IconButton>

                <IconButton 
                activated={selectedTool === "circle"} 
                icon={<Circle />} 
                onclick={() => { 
                    setIsselected("circle")
                }}>
                </IconButton>

            </div>
        </div>
    )
}
