

import { drawintial } from '@/drawElement';
import { Socket } from 'net';
import React, { useEffect, useRef } from 'react'

export function Canvas({roomId , socket}: 
    {
        roomId: string
        socket: WebSocket
    }) {
    // for using canvas we have to take the ref of the canvas using the userRef hook

    const Canvasref = useRef<HTMLCanvasElement>(null);


    // useeffect to change the context while the component is mounted using the ref
    
        useEffect(() => {
            if (Canvasref.current) {
                //const canvas =  Canvasref.current;
                drawintial(Canvasref.current , roomId , socket);
            }
        } , [Canvasref]);
    



        return (
            <div>
              <canvas height={1500} width={1500}  ref={Canvasref} ></canvas>
              <div className="absolute bottom-0 right-0 p-4 justify-center items-center flex flex-col">
                <div className="m-2 p-2">
                    <button className="bg-blue-500 text-white p-3 rounded-lg">React</button>
                </div>
                <div className="m-2 p-2">
                    <button className="bg-blue-500 text-white p-3 rounded-lg">Circle</button>
                </div>
        
              </div>
            </div>
          );
}

export default Canvas

