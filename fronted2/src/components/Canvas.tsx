

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
import { Circle, Pencil, RectangleHorizontal, Eraser } from 'lucide-react';
import { canvasClass } from '@/drawElement/canvasClass';

interface CanvasProps {
    roomId: string;
    socket: WebSocket;
}

// enum - type of the tool 
export type Tool = "pencil" | "circle" | "react" | "eraser";

export function Canvas({ roomId, socket }: CanvasProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [canVasClass, setcanVasClass] = useState<canvasClass>();
    const [selectedTool, setIsselected] = useState<Tool>('circle');
    const [isLoading, setIsLoading] = useState(true);

    // Handle tool change
    useEffect(() => {
        canVasClass?.setShape(selectedTool);
    }, [selectedTool, canVasClass]);

    // Initialize canvas
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !roomId) {
            console.error('Canvas or roomId not available');
            return;
        }

        setIsLoading(true);
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

        // Initialize drawing and load existing shapes
        drawintial(canvas, roomId, socket)
            .then(() => {
                setIsLoading(false);
                console.log('Canvas initialized successfully');
            })
            .catch(error => {
                console.error('Error initializing drawing:', error);
                setIsLoading(false);
            });

    }, [roomId, socket]);

    // Handle drag and drop of tools
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const tool = e.dataTransfer.getData('tool') as Tool;
        if (tool) {
            setIsselected(tool);
            
            // Set the starting position for drawing at the drop point
            if (canVasClass) {
                canVasClass.setStartPosition(e.clientX, e.clientY);
            }
        }
    };

    return (
        <div className="relative h-screen w-full">
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-70 z-50">
                    <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-3"></div>
                        <p className="text-gray-700">Loading canvas and shapes...</p>
                    </div>
                </div>
            )}
            
            <canvas 
                style={{
                    height: '100vh',
                    background: 'white',
                    overflow: 'hidden'
                }}
                ref={canvasRef} 
                width={window.innerWidth} 
                height={window.innerHeight}
                className="w-full h-full border border-gray-300"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            />
            
            <UppertoolBox setIsselected={setIsselected} selectedTool={selectedTool}/>
        </div>
    );
}




export function UppertoolBox({
    selectedTool,
    setIsselected 
}: {
    selectedTool: Tool,
    setIsselected: (s: Tool) => void;
}) {
    const [position, setPosition] = useState({ x: 20, y: 20 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
    
    // Handle mouse down for dragging
    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        setDragStart({
            x: e.clientX - position.x,
            y: e.clientY - position.y
        });
    };
    
    // Handle mouse move for dragging
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) {
                setPosition({
                    x: e.clientX - dragStart.x,
                    y: e.clientY - dragStart.y
                });
            }
        };
        
        const handleMouseUp = () => {
            setIsDragging(false);
        };
        
        if (isDragging) {
            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
        }
        
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [isDragging, dragStart]);
    
    // Handle tool selection with drag and drop
    const handleDragStart = (e: React.DragEvent, tool: Tool) => {
        e.dataTransfer.setData('tool', tool);
    };
    
    return (
        <div 
            style={{
                position: 'fixed',
                top: position.y,
                left: position.x,
                zIndex: 1000,
                userSelect: 'none'
            }}
            className={`bg-white rounded-lg shadow-lg p-3 border border-gray-200 transition-all ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
            <div 
                className="bg-gray-100 rounded-md p-2 mb-3 flex justify-between items-center"
                onMouseDown={handleMouseDown}
            >
                <span className="text-sm font-medium text-gray-700">Drawing Tools</span>
                <div className="h-4 w-8 flex justify-center items-center">
                    <div className="w-4 h-1 bg-gray-400 rounded"></div>
                </div>
            </div>
            
            <div className='grid grid-cols-4 gap-2'>
                <div 
                    className={`p-2 rounded-md flex flex-col items-center justify-center transition-all ${selectedTool === "pencil" ? 'bg-blue-100 shadow-inner' : 'hover:bg-gray-100'}`}
                    onClick={() => setIsselected("pencil")}
                    draggable
                    onDragStart={(e) => handleDragStart(e, "pencil")}
                >
                    <Pencil className="h-6 w-6 text-gray-700" />
                    <span className="text-xs mt-1 text-gray-600">Pencil</span>
                </div>

                <div 
                    className={`p-2 rounded-md flex flex-col items-center justify-center transition-all ${selectedTool === "react" ? 'bg-blue-100 shadow-inner' : 'hover:bg-gray-100'}`}
                    onClick={() => setIsselected("react")}
                    draggable
                    onDragStart={(e) => handleDragStart(e, "react")}
                >
                    <RectangleHorizontal className="h-6 w-6 text-gray-700" />
                    <span className="text-xs mt-1 text-gray-600">Rectangle</span>
                </div>

                <div 
                    className={`p-2 rounded-md flex flex-col items-center justify-center transition-all ${selectedTool === "circle" ? 'bg-blue-100 shadow-inner' : 'hover:bg-gray-100'}`}
                    onClick={() => setIsselected("circle")}
                    draggable
                    onDragStart={(e) => handleDragStart(e, "circle")}
                >
                    <Circle className="h-6 w-6 text-gray-700" />
                    <span className="text-xs mt-1 text-gray-600">Circle</span>
                </div>

                <div 
                    className={`p-2 rounded-md flex flex-col items-center justify-center transition-all ${selectedTool === "eraser" ? 'bg-blue-100 shadow-inner' : 'hover:bg-gray-100'}`}
                    onClick={() => setIsselected("eraser")}
                    draggable
                    onDragStart={(e) => handleDragStart(e, "eraser")}
                >
                    <Eraser className="h-6 w-6 text-gray-700" />
                    <span className="text-xs mt-1 text-gray-600">Eraser</span>
                </div>
            </div>
            
            <div className="mt-3 pt-2 border-t border-gray-200">
                <div className="text-xs text-gray-500 text-center">
                    Drag tools to canvas or click to select
                </div>
            </div>
        </div>
    );
}
