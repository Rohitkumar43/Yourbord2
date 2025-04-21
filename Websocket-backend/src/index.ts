import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { prismaClient } from "../../Backend/database/src/index";

const PORT = 8080;
const JWT_SECRET = process.env.JWT_SECRET ?? "121212";

interface User {
    ws: WebSocket;
    rooms: string[];
    userId: string;
}

const users: User[] = [];
let connectionCount = 0;

const wss = new WebSocketServer({ 
    port: PORT,
    host: 'localhost',
    // Add CORS settings
    verifyClient: (info, callback) => {
        // Allow connections from your frontend origin
        const origin = info.origin;
        const isValidOrigin = origin === 'http://localhost:3000';
        callback(isValidOrigin, 200, 'Unauthorized origin');
    }
});

console.log(`WebSocket server listening on ws://localhost:${PORT}`);

wss.on('connection', async function connection(ws: WebSocket, request: IncomingMessage) {
    connectionCount++;
    console.log(`[${new Date().toISOString()}] New connection #${connectionCount}`);
    
    try {
        // Get token from URL
        // const url = request.url;
        // if (!url) {
        //     console.log('Connection rejected: No URL provided');
        //     ws.send(JSON.stringify({ error: "No URL provided" }));
        //     ws.close();
        //     return;
        // }

        // // Parse token
        // const queryParams = new URLSearchParams(url.split('?')[1]);
        // const token = queryParams.get("token");
        
        // if (!token) {
        //     console.log('Connection rejected: No token provided');
        //     ws.send(JSON.stringify({ error: "No token provided" }));
        //     ws.close();
        //     return;
        // }


        // Get token and roomId from URL
        const url = new URL(request.url ?? '', 'ws://localhost:8080');
        const token = url.searchParams.get('token');
        const roomId = url.searchParams.get('roomId');

        if (!token || !roomId) {
            console.log('Connection rejected: Missing token or roomId');
            ws.send(JSON.stringify({ error: "Missing token or roomId" }));
            ws.close();
            return;
        }


        // Verify token
        const userAuth = jwt.verify(token, JWT_SECRET) as JwtPayload;
        if (!userAuth || !userAuth.userId) {
            console.log('Connection rejected: Invalid token');
            ws.send(JSON.stringify({ error: "Invalid token" }));
            ws.close();
            return;
        }

        console.log(`User ${userAuth.userId} authenticated successfully`);

        // Add user to connected users
        const user: User = {
            ws,
            rooms: [],
            userId: userAuth.userId.toString()
        };
        users.push(user);
        console.log(`Total connected users: ${users.length}`);

        // Handle messages
        ws.on('message', async function message(data) {
            try {
                const messageString = data.toString();
                console.log(`Received message from user ${user.userId}:`, messageString);
                
                const parsedData = JSON.parse(messageString);
                
                if (parsedData.type === "join_room") {
                    user.rooms.push(parsedData.roomId);
                    console.log(`User ${user.userId} joined room ${parsedData.roomId}`);
                    ws.send(JSON.stringify({
                        type: 'system',
                        message: `Joined room ${parsedData.roomId}`
                    }));
                }
                
                if (parsedData.type === "chat") {
                    console.log(`Saving message in room ${parsedData.roomId}`);
                    await prismaClient.chatHistory.create({
                        data: {
                            message: parsedData.message,
                            roomId: parseInt(parsedData.roomId),
                            userId: parseInt(user.userId),
                            createdAt: new Date()
                        }
                    });

                    // Broadcast to all users in the room
                    users.forEach(u => {
                        if (u.rooms.includes(parsedData.roomId)) {
                            u.ws.send(JSON.stringify({
                                type: 'chat',
                                message: parsedData.message,
                                roomId: parsedData.roomId,
                                userId: user.userId,
                                timestamp: new Date()
                            }));
                        }
                    });
                }
            } catch (error) {
                console.error("Error processing message:", error);
                ws.send(JSON.stringify({ error: "Failed to process message" }));
            }
        });

        // Handle disconnection
        ws.on('close', () => {
            connectionCount--;
            const index = users.findIndex(u => u.ws === ws);
            if (index > -1) {
                users.splice(index, 1);
                console.log(`User ${user.userId} disconnected. Total users: ${users.length}`);
            }
        });

    } catch (error) {
        console.error("Connection error:", error);
        ws.send(JSON.stringify({ error: "Connection failed" }));
        ws.close();
    }
});

// Error handling for the server
wss.on('error', (error) => {
    console.error('WebSocket Server Error:', error);
});

process.on('SIGINT', () => {
    console.log('Shutting down WebSocket server...');
    wss.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});


