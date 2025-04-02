import { IncomingMessage } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";
import { prismaClient } from "../../Backend/database/src/index";

const JWT_SECRET = process.env.JWT_SECRET ?? "121212";
const wss = new WebSocketServer({ port: 8080 });

interface User {
  ws: WebSocket;
  userId: number;  // Changed to number to match Prisma schema
  rooms: number[]; // Changed to number to match Prisma schema
}

interface ChatMessage {
  type: 'chat' | 'join_room' | 'leave_room';
  roomId: number;
  message?: string;
}

const users: User[] = [];

function checkUserAuth(token: string): JwtPayload | null {
  // check the user is authenticated or not to join the socket connection via token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || typeof (decoded as JwtPayload).userId === 'undefined') {
      return null;
    }
    return decoded as JwtPayload;
  } catch (error) {
    console.log("Token Verification Failed:", error);
    return null;
  }
}

// Add connection tracking
console.log('WebSocket server started on port 8080');
let connectionCount = 0;

wss.on('connection', async function connection(ws: WebSocket, request: IncomingMessage) {
  connectionCount++;
  console.log(`New connection established. Total connections: ${connectionCount}`);
  
  try {
    // Get token from URL
    const url = request.url;
    if (!url) {
      console.log('Connection rejected: No URL provided');
      ws.send(JSON.stringify({ error: "No URL provided" }));
      ws.close();
      return;
    }
// from that url it take the name of the token and then it will check the user is authenticated or not
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get("token");
    
    if (!token) {
      console.log('Connection rejected: No token provided');
      ws.send(JSON.stringify({ error: "No token provided" }));
      ws.close();
      return;
    }

    const userAuth = checkUserAuth(token);
    if (!userAuth) {
      console.log('Connection rejected: Authentication failed');
      ws.send(JSON.stringify({ error: "Authentication failed" }));
      ws.close();
      return;
    }

    // Add user to users array
    const userId = parseInt(userAuth.userId);
    console.log(`User ${userId} authenticated successfully`);
    
    users.push({
      userId,
      ws,
      rooms: []
    });

    ws.on('message', async function message(data) {
      try {
        const messageString = data.toString();
        console.log(`Received message from user ${userId}:`, messageString);
        
        const parsedData = JSON.parse(messageString) as ChatMessage;
        const user = users.find(x => x.ws === ws);
    
        if (!user) {
          console.log(`User ${userId} not found in users array`);
          ws.send(JSON.stringify({ error: "User not found" }));
          return;
        }
    
        switch (parsedData.type) {
          case 'join_room':
            console.log(`User ${userId} joining room ${parsedData.roomId}`);
            user.rooms.push(parsedData.roomId);
            ws.send(JSON.stringify({
              type: 'system',
              message: `Joined room ${parsedData.roomId}`
            }));
            break;
    
          case 'leave_room':
            user.rooms = user.rooms.filter(x => x !== parsedData.roomId);
            ws.send(JSON.stringify({
              type: 'system',
              message: `Left room ${parsedData.roomId}`
            }));
            break;
    
          case 'chat':
            if (!parsedData.message) {
              console.log(`User ${userId} attempted to send empty message`);
              ws.send(JSON.stringify({ error: "No message provided" }));
              return;
            }
    
            console.log(`Saving message from user ${userId} in room ${parsedData.roomId}`);
            // Save message to database
            const savedMessage = await prismaClient.chatHistory.create({
              data: {
                message: parsedData.message,
                roomId: parsedData.roomId,
                userId: userId,
                createdAt: new Date()
              }
            });
    
            console.log("Message saved:", savedMessage);
    
            // Broadcast message to all users in the room
            const messageToSend = {
              type: 'chat',
              message: parsedData.message,
              roomId: parsedData.roomId,
              userId: userId,
              timestamp: new Date()
            };
    
            const recipientCount = users.filter(u => u.rooms.includes(parsedData.roomId)).length;
            console.log(`Broadcasting message to ${recipientCount} users in room ${parsedData.roomId}`);
    
            users.forEach(u => {
              if (u.rooms.includes(parsedData.roomId)) {
                u.ws.send(JSON.stringify(messageToSend));
              }
            });
            break;
        }
      } catch (error) {
        console.error("Message processing error:", error);
        ws.send(JSON.stringify({ error: "Failed to process message" }));
      }
    });
    
    ws.on('close', () => {
      connectionCount--;
      const index = users.findIndex(u => u.ws === ws);
      if (index > -1) {
        console.log(`User ${userId} disconnected. Total connections: ${connectionCount}`);
        users.splice(index, 1);
      }
    });

  } catch (error) {
    console.error("Connection error:", error);
    ws.send(JSON.stringify({ error: "Connection failed" }));
    ws.close();
  }
});

// Error handling for the WebSocket server
wss.on('error', (error) => {
  console.error("WebSocket Server Error:", error);
});


