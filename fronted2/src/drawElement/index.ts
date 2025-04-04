
import axios from "axios";
import { BACKEND_URL } from "../../config";

// Here we areite all the functinality of the canvas ........

// interface of tjhe shape
type Shape =  {
    //@ts-ignore
    type: 'react',
    x: number;
    y: number;
    width: number;
    height: number;
} | {
    type: 'circle',
    centreX: number;
    centerY: number;
    radius: number;
} 

export async function  drawintial(canvas: HTMLCanvasElement , roomId: string , socket : WebSocket) {
    const ctx  = canvas.getContext('2d'); 


    if (!roomId) {
        console.error("Room ID is undefined");
        return;
    }

            if (!ctx) {
                return;
            }

            // connect it with the socket
            socket.onmessage = (event) => {
                const message = JSON.parse(event.data);

                if(message.type === 'chat'){
                    const parseData = JSON.parse(message.message);
                    existingShapes.push(parseData);
                    clearContext(canvas, ctx, existingShapes);
                }
            }


            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // take all the shape in the array
            let existingShapes: Shape[] =(await getExistingShapes(roomId)) || [];

            // when element get cliecked then it will move
            clearContext(canvas, ctx, existingShapes);
            let clicked = false;
            let startX = 0;
            let startY = 0;


             // now take the mouse event to draw on the canvas and the move it 

            canvas.addEventListener("mousedown" , (event) => {
                const rect = canvas.getBoundingClientRect(); // Get canvas position
                clicked = true;
                startX = event.clientX;
                startY = event.clientY;
             });


             // mouseup	->  Jab mouse chhoda jaye -> 	Drawing end

            canvas.addEventListener("mouseup" , (event) => {
                clicked = false;
                // get the existing shape
                const height = event.clientY - startY;
                const width = event.clientX - startX;
                // take the tool and write if else condition 
             // @ts-ignore
                const selectedTool = window.selectedTool;
                let shape : Shape | null =  null;
                if (selectedTool === "react") {
                    shape = {
                        //@ts-ignore
                        type: "react",
                        x: startX,
                        y: startY,
                        width,
                        height
                    }
                } else if(selectedTool === "circle"){
                    const radius = Math.max(height + width) / 2;
                    shape = {
                        //@ts-ignore
                        type: "circle",
                        radius: radius,
                        centreX: startX + radius,
                        centerY: startY  + radius ,
                    }
                }

                if(!shape){
                    return;
                }

                existingShapes.push(shape);
                // use the socket to send the data to the backend

                socket.send(JSON.stringify({
                    type: 'chat',
                    message: JSON.stringify(shape),
                    roomId
                }));

             });



// it actually re render the components means the reactagnle and diff shapes 
// mousemove -> Jab mouse move kare -> 	Live drawing
             canvas.addEventListener("mousemove" , (event) => {
                if (clicked) {
                    const height = event.clientY - startY;
                    const width = event.clientX - startX;
                    clearContext(canvas, ctx, existingShapes);
                    ctx.strokeStyle = 'white';
                    
                    // make the logic for the sll the shape z
                    // @ts-ignore
                    const selectedTool = window.selectedTool;
                    if (selectedTool === "react") {
                        //ctx.strokeRect(startX , startY , width , height) 
                        ctx.strokeRect(10, 10, 100, 100);
                        // for the circle
                    }else if(selectedTool === "circle"){
                        const radius = Math.max( height + width) / 2;
                        const centreX = startX + radius;
                        const centerY = startY + radius;
                        ctx.beginPath();
                        ctx.arc(centreX , centerY , radius , 0 , Math.PI * 2 )
                        ctx.stroke(); // render the circle 
                        ctx.closePath();
                    }
                    
                    //ctx.strokeRect(startX, startY, width, height);

                    // console.log(event.clientX);
                    // console.log(event.clientY)
                }
             });

        }

        // fxn for the clear the context and the shape 


        function clearContext(canvas: HTMLCanvasElement , ctx: CanvasRenderingContext2D , existingShapes: Shape[]) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // use map for the exting shape 
            existingShapes.map((shape) => {
                if (shape.type === 'react') {
                    ctx.strokeStyle = 'white';
                    ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                    ctx.fillRect(shape.x, shape.y, shape.width, shape.height);  
                } else if(shape.type === "circle"){
                    ctx.strokeStyle = 'white';
                    ctx.beginPath();
                    ctx.arc(shape.centreX , shape.centerY , shape.radius , 0 , Math.PI * 2 );
                    ctx.stroke();  //render the image
                    ctx.closePath();

                    // pencil fxn 
                } 

            })
        }



        // fteching the data from the backend i.e the existing shape


        // the shape we will get which is draw pahle se 
export async function getExistingShapes(roomId: string) {
    try {
        const response = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
        const messages = response.data.messages;

        if(!messages) return [];

        // Map over the data and return the shapes
        const shapes = messages.map((x : {message: string}) => {
            const messageData = JSON.parse(x.message);
            return messageData.shape;
        });

        return shapes;
        
    } catch (error) {
        console.log('Error fetching existing shapes:', error);
        return [];
    }
}


// Now we will work on diff shapes and size 




