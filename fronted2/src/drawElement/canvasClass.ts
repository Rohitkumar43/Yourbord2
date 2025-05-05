
//  type of the shapes

import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./httpfxn";

type Shape =  {
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
} | {
    type: 'pencil',
    points: {x: number, y: number}[];
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
        this.selectedTool = tool;
    }
    
    // Set the starting position for drawing (used for drag and drop)
    setStartPosition(x: number, y: number) {
        this.startX = x;
        this.startY = y;
        this.clicked = true;
        
        // Simulate a mouseup event after a short delay to complete the shape
        setTimeout(() => {
            const event = new MouseEvent('mouseup', {
                clientX: x + 100, // Add some width/height to make the shape visible
                clientY: y + 100,
                bubbles: true
            });
            this.canvas.dispatchEvent(event);
        }, 100);
    }

    async init(){
        this.existingShapes =await getExistingShapes(this.roomId) 
        this.clearContext();
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
        this.ctx.fillStyle = 'white';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // use map for the exting shape 
        this.existingShapes.map((shape) => {
            if (shape.type === 'react') {
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            } else if(shape.type === "circle"){
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(shape.centreX, shape.centerY, Math.abs(shape.radius), 0, Math.PI * 2);
                this.ctx.stroke();  //render the image
                this.ctx.closePath();
            } else if(shape.type === "pencil" && shape.points && shape.points.length > 0) {
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.moveTo(shape.points[0].x, shape.points[0].y);
                
                for (let i = 1; i < shape.points.length; i++) {
                    this.ctx.lineTo(shape.points[i].x, shape.points[i].y);
                }
                
                this.ctx.stroke();
                this.ctx.closePath();
            }
        })
    }



    mouseHandler(){
        // For pencil drawing
        let currentPencilPoints: {x: number, y: number}[] = [];

        this.canvas.addEventListener("mousedown", (event) => {
            const rect = this.canvas.getBoundingClientRect(); // Get canvas position
            this.clicked = true;
            this.startX = event.clientX;
            this.startY = event.clientY;
            
            // Start a new pencil path if pencil tool is selected
            if (this.selectedTool === 'pencil') {
                currentPencilPoints = [{x: event.clientX, y: event.clientY}];
            }
        });

        // mouseup -> When mouse is released -> Drawing end
        this.canvas.addEventListener("mouseup", (event) => {
            this.clicked = false;
            // get the existing shape
            const height = event.clientY - this.startY;
            const width = event.clientX - this.startX;
            
            let shape: Shape | null = null;
            
            if (this.selectedTool === "react") {
                shape = {
                    type: "react",
                    x: this.startX,
                    y: this.startY,
                    width,
                    height
                };
            } else if (this.selectedTool === "circle") {
                const radius = Math.max(Math.abs(height), Math.abs(width)) / 2;
                shape = {
                    type: "circle",
                    radius: radius,
                    centreX: this.startX + width/2,
                    centerY: this.startY + height/2
                };
            } else if (this.selectedTool === "pencil" && currentPencilPoints.length > 0) {
                // Add the final point
                currentPencilPoints.push({x: event.clientX, y: event.clientY});
                
                shape = {
                    type: "pencil",
                    points: currentPencilPoints
                };
                
                // Reset points for next drawing
                currentPencilPoints = [];
            }

            if (!shape) {
                return;
            }

            this.existingShapes.push(shape);
            
            // Send the shape data to the server
            this.socket.send(JSON.stringify({
                type: 'chat',
                message: JSON.stringify(shape),
                roomId: this.roomId
            }));
        });

        // mousemove -> When mouse moves -> Live drawing
        this.canvas.addEventListener("mousemove", (event) => {
            if (this.clicked) {
                const height = event.clientY - this.startY;
                const width = event.clientX - this.startX;
                
                // For pencil, add the current point to the path
                if (this.selectedTool === "pencil") {
                    currentPencilPoints.push({x: event.clientX, y: event.clientY});
                }
                
                this.clearContext();
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 2;
                
                if (this.selectedTool === "react") {
                    // Draw rectangle preview
                    this.ctx.strokeRect(this.startX, this.startY, width, height);
                } else if (this.selectedTool === "circle") {
                    // Draw circle preview
                    const radius = Math.max(Math.abs(height), Math.abs(width)) / 2;
                    const centreX = this.startX + width/2;
                    const centerY = this.startY + height/2;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(centreX, centerY, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                } else if (this.selectedTool === "pencil" && currentPencilPoints.length > 0) {
                    // Draw pencil preview
                    this.ctx.beginPath();
                    this.ctx.moveTo(currentPencilPoints[0].x, currentPencilPoints[0].y);
                    
                    for (let i = 1; i < currentPencilPoints.length; i++) {
                        this.ctx.lineTo(currentPencilPoints[i].x, currentPencilPoints[i].y);
                    }
                    
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        });
    }
}