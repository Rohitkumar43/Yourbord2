
//  type of the shapes

import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./httpfxn";

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



export class canvasClass{
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private existingShapes: Shape[];
    private roomId: string
    private socket: WebSocket
    private clicked: boolean
    private startX: number;
    private startY: number;
    private selectedTool: Tool = 'circle'



    constructor(canvas: HTMLCanvasElement , roomId: string , socket: WebSocket
    ){
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d')!; 
        this.existingShapes = [];
        this.roomId = roomId;
        this.socket = socket;
        this.clicked = false;
        this.startX = 0;
        this.startY = 0;
        this.init();
        this.initHandler();
        this.clearContext();
        this.mouseHandler();
    }

    setShape(tool: 'circle' | 'react' | 'pencil'){
        this.selectedTool(tool);
 
    }

    async init(){
        this.existingShapes =await getExistingShapes(this.roomId) 
    };

    initHandler() {
         // connect it with the socket
         this.socket.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if(message.type === 'chat'){
                const parseData = JSON.parse(message.message);
                this.existingShapes.push(parseData);
                this.clearContext();
            }
        }

    }

    // fxn for the clear the context and the shape 
    clearContext() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // use map for the exting shape 
        this.existingShapes.map((shape) => {
            if (shape.type === 'react') {
                this.ctx.strokeStyle = 'white';
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
                this.ctx.fillRect(shape.x, shape.y, shape.width, shape.height);  
            } else if(shape.type === "circle"){
                this.ctx.strokeStyle = 'white';
                this.ctx.beginPath();
                this.ctx.arc(shape.centreX , shape.centerY , shape.radius , 0 , Math.PI * 2 );
                this.ctx.stroke();  //render the image
                this.ctx.closePath();

                // pencil fxn 
            } 

        })
    }



    mouseHandler(){
        this.canvas.addEventListener("mousedown" , (event) => {
            const rect = this.canvas.getBoundingClientRect(); // Get canvas position
            this.clicked = true;
            this.startX = event.clientX;
            this.startY = event.clientY;
         });


         // mouseup	->  Jab mouse chhoda jaye -> 	Drawing end

        this.canvas.addEventListener("mouseup" , (event) => {
            this.clicked = false;
            // get the existing shape
            const height = event.clientY - this.startY;
            const width = event.clientX - this.startX;
            // take the tool and write if else condition 
         // @ts-ignore
            const selectedTool = window.selectedTool;
            let shape : Shape | null =  null;
            if (selectedTool === "react") {
                shape = {
                    //@ts-ignore
                    type: "react",
                    x: this.startX,
                    y: this.startY,
                    width,
                    height
                }
            } else if(selectedTool === "circle"){
                const radius = Math.max(height + width) / 2;
                shape = {
                    //@ts-ignore
                    type: "circle",
                    radius: radius,
                    centreX: this.startX + radius,
                    centerY: this.startY  + radius ,
                }
            }

            if(!shape){
                return;
            }

            this.existingShapes.push(shape);
            // use the socket to send the data to the backend

            this.socket.send(JSON.stringify({
                type: 'chat',
                message: JSON.stringify(shape),
                roomId : this.roomId
            }));

         });



// it actually re render the components means the reactagnle and diff shapes 
// mousemove -> Jab mouse move kare -> 	Live drawing
        this.canvas.addEventListener("mousemove" , (event) => {
            if (this.clicked) {
                const height = event.clientY - this.startY;
                const width = event.clientX - this.startX;
                this.clearContext();
                this.ctx.strokeStyle = 'white';
                
                // make the logic for the sll the shape z
                // @ts-ignore
                const selectedTool = window.selectedTool;
                if (selectedTool === "react") {
                    //ctx.strokeRect(startX , startY , width , height) 
                    this.ctx.strokeRect(10, 10, 100, 100);
                    // for the circle
                }else if(selectedTool === "circle"){
                    const radius = Math.max( height + width) / 2;
                    const centreX = this.startX + radius;
                    const centerY = this.startY + radius;
                    this.ctx.beginPath();
                    this.ctx.arc(centreX , centerY , radius , 0 , Math.PI * 2 )
                    this.ctx.stroke(); // render the circle 
                    this.ctx.closePath();
                }
                
                //ctx.strokeRect(startX, startY, width, height);

                // console.log(event.clientX);
                // console.log(event.clientY)
            }
        });

    }
    


}