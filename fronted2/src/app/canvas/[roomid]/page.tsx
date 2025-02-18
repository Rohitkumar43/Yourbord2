'use client';

import React, { useEffect, useRef } from 'react'

export default function canvas() {
    // for using canvas we have to take the ref of the canvas using the userRef hook
    const Canvasref = useRef<HTMLCanvasElement>(null);


    // useeffect to change the context while the component is mounted using the ref

    useEffect(() => {

        if (Canvasref.current) {
            const canvas =  Canvasref.current;
            const ctx  = canvas.getContext('2d'); 

            if (!ctx) {
                return;
            }

            // when element get cliecked then it will move

            let clicked = false;
            let startX = 0;
            let startY = 0;


             // now take the mouse event to draw on the canvas and the move it 

            canvas.addEventListener("mousedown" , (event) => {
                clicked = true;
                startX = event.clientX;
                startY = event.clientY;
             });

            canvas.addEventListener("mouseup" , (event) => {
                clicked = false;
                console.log(event.clientX);
                console.log(event.clientY)
             });

             canvas.addEventListener("mousemove" , (event) => {
                if (clicked) {
                    const height = event.clientY - startY;
                    const width = event.clientX - startX;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.strokeRect(startX, startY, width, height);
                    // console.log(event.clientX);
                    // console.log(event.clientY)
                    
                }
             });

             


            ctx.strokeRect(10, 10, 100, 100);

        }

    } , [Canvasref])

   
    
  return (
    <div>
      <canvas height={1500} width={1500}  ref={Canvasref} className='bg-white'></canvas>
    </div>
  )
}

