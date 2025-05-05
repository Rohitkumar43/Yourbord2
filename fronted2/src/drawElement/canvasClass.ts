
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
    
    // Helper method to find a shape at a specific point
    private findShapeAtPoint(x: number, y: number): number {
        // Loop through shapes in reverse order (top to bottom in z-index)
        for (let i = this.existingShapes.length - 1; i >= 0; i--) {
            const shape = this.existingShapes[i];
            
            if (shape.type === 'react') {
                // Check if point is inside rectangle
                if (
                    x >= shape.x && 
                    x <= shape.x + shape.width && 
                    y >= shape.y && 
                    y <= shape.y + shape.height
                ) {
                    return i;
                }
            } 
            else if (shape.type === 'circle') {
                // Check if point is inside circle
                const distance = Math.sqrt(
                    Math.pow(x - shape.centreX, 2) + 
                    Math.pow(y - shape.centerY, 2)
                );
                if (distance <= shape.radius) {
                    return i;
                }
            }
            else if (shape.type === 'pencil' && shape.points.length > 0) {
                // For pencil, check if point is near any line segment
                for (let j = 1; j < shape.points.length; j++) {
                    const p1 = shape.points[j-1];
                    const p2 = shape.points[j];
                    
                    // Calculate distance from point to line segment
                    const distance = this.distanceToLineSegment(
                        p1.x, p1.y, p2.x, p2.y, x, y
                    );
                    
                    if (distance < 10) { // 10px tolerance
                        return i;
                    }
                }
            }
        }
        
        return -1; // No shape found
    }
    
    // Helper method to calculate distance from point to line segment
    private distanceToLineSegment(
        x1: number, y1: number, 
        x2: number, y2: number, 
        px: number, py: number
    ): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        
        if (len_sq !== 0) {
            param = dot / len_sq;
        }
        
        let xx, yy;
        
        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }
        
        const dx = px - xx;
        const dy = py - yy;
        
        return Math.sqrt(dx * dx + dy * dy);
    }



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

    setShape(tool: 'circle' | 'react' | 'pencil' | 'eraser'){
        this.selectedTool = tool;
    }
    
    // Set the starting position for drawing (used for drag and drop)
    setStartPosition(x: number, y: number) {
        this.startX = x;
        this.startY = y;
        this.clicked = true;
        
        // Draw a temporary preview at the starting point to make it visible
        this.clearContext();
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 2;
        
        // Draw a small indicator based on the selected tool
        if (this.selectedTool === "react") {
            this.ctx.strokeRect(x, y, 10, 10); // Small rectangle indicator
        } else if (this.selectedTool === "circle") {
            this.ctx.beginPath();
            this.ctx.arc(x, y, 5, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();
        } else if (this.selectedTool === "pencil") {
            this.ctx.beginPath();
            this.ctx.arc(x, y, 3, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.closePath();
        } else if (this.selectedTool === "eraser") {
            // Draw eraser indicator
            this.ctx.strokeStyle = 'red';
            this.ctx.beginPath();
            this.ctx.arc(x, y, 10, 0, Math.PI * 2);
            this.ctx.stroke();
            this.ctx.closePath();
            
            // Draw X inside to indicate deletion
            this.ctx.beginPath();
            this.ctx.moveTo(x - 5, y - 5);
            this.ctx.lineTo(x + 5, y + 5);
            this.ctx.moveTo(x + 5, y - 5);
            this.ctx.lineTo(x - 5, y + 5);
            this.ctx.stroke();
            this.ctx.closePath();
        }
        
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
                
                // Handle eraser actions from other users
                if (parseData.type === 'eraser' && parseData.action === 'delete') {
                    // Remove the shape at the specified index if it exists
                    if (parseData.shapeIndex >= 0 && parseData.shapeIndex < this.existingShapes.length) {
                        this.existingShapes.splice(parseData.shapeIndex, 1);
                    }
                } else {
                    // Add new shape
                    this.existingShapes.push(parseData);
                }
                
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
            if (!this.clicked) return; // Skip if not in drawing mode
            
            this.clicked = false;
            
            // Handle eraser tool separately
            if (this.selectedTool === "eraser") {
                // Find shape at the clicked point
                const shapeIndex = this.findShapeAtPoint(event.clientX, event.clientY);
                
                if (shapeIndex !== -1) {
                    // Remove the shape from the array
                    const removedShape = this.existingShapes.splice(shapeIndex, 1)[0];
                    
                    // Redraw the canvas
                    this.clearContext();
                    
                    // Send a message to the server about the deletion
                    // We'll use a special format to indicate deletion
                    this.socket.send(JSON.stringify({
                        type: 'chat',
                        message: JSON.stringify({
                            type: 'eraser',
                            action: 'delete',
                            shapeIndex: shapeIndex
                        }),
                        roomId: this.roomId
                    }));
                    
                    return;
                }
            }
            
            // For other tools, continue with shape creation
            const height = event.clientY - this.startY;
            const width = event.clientX - this.startX;
            
            let shape: Shape | null = null;
            
            // Create only one shape based on the selected tool
            if (this.selectedTool === "react") {
                // Only create rectangle
                shape = {
                    type: "react",
                    x: this.startX,
                    y: this.startY,
                    width,
                    height
                };
            } 
            else if (this.selectedTool === "circle") {
                // Only create circle
                const radius = Math.max(Math.abs(height), Math.abs(width)) / 2;
                shape = {
                    type: "circle",
                    radius: radius,
                    centreX: this.startX + width/2,
                    centerY: this.startY + height/2
                };
            } 
            else if (this.selectedTool === "pencil" && currentPencilPoints.length > 0) {
                // Only create pencil path
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
            // Always show eraser cursor when eraser tool is selected
            if (this.selectedTool === "eraser" && !this.clicked) {
                // Just show the eraser cursor without affecting shapes
                const x = event.clientX;
                const y = event.clientY;
                
                // Find if there's a shape under the cursor
                const shapeIndex = this.findShapeAtPoint(x, y);
                
                // Redraw everything
                this.clearContext();
                
                // Draw eraser cursor
                this.ctx.strokeStyle = shapeIndex !== -1 ? 'red' : 'gray';
                this.ctx.lineWidth = 2;
                this.ctx.beginPath();
                this.ctx.arc(x, y, 10, 0, Math.PI * 2);
                this.ctx.stroke();
                
                // Draw X inside if a shape is found
                if (shapeIndex !== -1) {
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - 5, y - 5);
                    this.ctx.lineTo(x + 5, y + 5);
                    this.ctx.moveTo(x + 5, y - 5);
                    this.ctx.lineTo(x - 5, y + 5);
                    this.ctx.stroke();
                }
                
                this.ctx.closePath();
                return;
            }
            
            if (this.clicked) {
                const height = event.clientY - this.startY;
                const width = event.clientX - this.startX;
                
                // For pencil, add the current point to the path
                if (this.selectedTool === "pencil") {
                    currentPencilPoints.push({x: event.clientX, y: event.clientY});
                }
                
                // Clear the context and redraw existing shapes
                this.clearContext();
                this.ctx.strokeStyle = 'black';
                this.ctx.lineWidth = 2;
                
                // Draw only the selected tool's preview - ensuring mutual exclusivity
                if (this.selectedTool === "react") {
                    // Draw rectangle preview only
                    this.ctx.strokeRect(this.startX, this.startY, width, height);
                } 
                else if (this.selectedTool === "circle") {
                    // Draw circle preview only
                    const radius = Math.max(Math.abs(height), Math.abs(width)) / 2;
                    const centreX = this.startX + width/2;
                    const centerY = this.startY + height/2;
                    
                    this.ctx.beginPath();
                    this.ctx.arc(centreX, centerY, radius, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.closePath();
                } 
                else if (this.selectedTool === "pencil" && currentPencilPoints.length > 0) {
                    // Draw pencil preview only
                    this.ctx.beginPath();
                    this.ctx.moveTo(currentPencilPoints[0].x, currentPencilPoints[0].y);
                    
                    for (let i = 1; i < currentPencilPoints.length; i++) {
                        this.ctx.lineTo(currentPencilPoints[i].x, currentPencilPoints[i].y);
                    }
                    
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
                else if (this.selectedTool === "eraser") {
                    // Show eraser cursor during drag
                    const x = event.clientX;
                    const y = event.clientY;
                    
                    this.ctx.strokeStyle = 'red';
                    this.ctx.lineWidth = 2;
                    this.ctx.beginPath();
                    this.ctx.arc(x, y, 10, 0, Math.PI * 2);
                    this.ctx.stroke();
                    this.ctx.beginPath();
                    this.ctx.moveTo(x - 5, y - 5);
                    this.ctx.lineTo(x + 5, y + 5);
                    this.ctx.moveTo(x + 5, y - 5);
                    this.ctx.lineTo(x - 5, y + 5);
                    this.ctx.stroke();
                    this.ctx.closePath();
                }
            }
        });
    }
}