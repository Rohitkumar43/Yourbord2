// import { request } from 'express';
// import { WebSocketServer , WebSocket } from 'ws';
// import jwt, { JwtPayload } from "jsonwebtoken";
// import {prismaClient} from "../../Backend/database/src/index";

// const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT
// const wss = new WebSocketServer({ port: 8080 });

// // Here we will make a global state to store the user and the no of rooms the user has joined and rhe msg he has sent
// // Also interface for the user

// interface User{
//   ws: WebSocket;
//   userId: string;
//   rooms: string[];
// }

// const users: User[] = [];

// // this function will check the user is authenticated or not to join the socket connection
// function checkUserAuth(token: string): JwtPayload | null {
//   try {
//     const decode = jwt.verify(token , JWT_SECRET)
//   if (!decode || !(decode as JwtPayload).userId) {
//     return null;
//   }
//   return decode as JwtPayload;
//   } catch (error) {
//     console.log("Token Verification Fail:", error);
//     return null;
//   }
// } 

// wss.on('connection', function connection(ws) {
//   // basically in this first it wiil checkk the authoriuxation and then give  the 
//   // permission to connnect .....
//   const url = request.url; // ws:localhost://30000?token=123123;
//   if (!url) {
//     return
//   }
//   const queryParam = new URLSearchParams(url.split('?')['1']);
//   const token = queryParam.get("token") || "";
//  // now we have to decod this token and the check the user is authenticated or not
//   const userAuthenticated = checkUserAuth(token);

//   if (userAuthenticated == null){
//     ws.send("You are not authenticated");
//     ws.close();
//     return null;
//   }

// // now push the data to the user array
// users.push({
//   userId: userAuthenticated.userId,
//   ws,
//   rooms: []
// })


//   ws.on('message', async function message(data) {
//     // parssse the data 
//     const parseData = JSON.parse(data as unknown as string);  // {type: join_room , roomId: 132}

//     if(parseData.type === 'join_room'){
//       const user = users.find(x => x.ws === ws);
//       user?.rooms.push(parseData.roomId);
//     }

//     // if i want to remove that room 
//     if (parseData.type === 'leave_room'){
//       const user = users.find(x => x.ws === ws);
//       if(!user){
//         return;

//       }
//       user.rooms = user.rooms.filter(x => x === parseData.roomId);
//     }

    

//     // if i want to send the message to the room
//     if (parseData.type === 'chat') {
//       const roomId = parseData.roomId;
//       const message = parseData.message;

//       // save the msg in the db
//     await prismaClient.chatHistory.create({
//       data: {
//         message,
//         roomId,
//         userId: userAuthenticated.userId
//       }
//     })

//       users.forEach(user => {
//         if (user.rooms.includes(roomId)) {
//           user.ws.send(JSON.stringify({
//             type: 'chat',
//             message: message,
//             roomId
//           }))
//         }
//       })
      
//     }
//   });

  
// });


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

wss.on('connection', async function connection(ws: WebSocket, request: IncomingMessage) {
  try {
    // Get token from URL
    const url = request.url;
    if (!url) {
      ws.send(JSON.stringify({ error: "No URL provided" }));
      ws.close();
      return;
    }
// from that url it take the name of the token and then it will check the user is authenticated or not
    const queryParams = new URLSearchParams(url.split('?')[1]);
    const token = queryParams.get("token");
    
    if (!token) {
      ws.send(JSON.stringify({ error: "No token provided" }));
      ws.close();
      return;
    }

    const userAuth = checkUserAuth(token);
    if (!userAuth) {
      ws.send(JSON.stringify({ error: "Authentication failed" }));
      ws.close();
      return;
    }

    // Add user to users array
    const userId = parseInt(userAuth.userId);
    users.push({
      userId,
      ws,
      rooms: []
    });

    ws.on('message', async function message(data) {
      try {
        const parsedData = JSON.parse(data.toString()) as ChatMessage;
        const user = users.find(x => x.ws === ws);
        
        if (!user) {
          ws.send(JSON.stringify({ error: "User not found" }));
          return;
        }

        switch (parsedData.type) {
          case 'join_room':
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
              ws.send(JSON.stringify({ error: "No message provided" }));
              return;
            }

            // Save message to database
            const savedMessage = await prismaClient.chatHistory.create({
              data: {
                message: parsedData.message,
                roomId: parsedData.roomId,
                userId: userId,
                createdAt: new Date()
              }
            });

            console.log("Message saved to database:", savedMessage);

            // Broadcast message to all users in the room
            const messageToSend = {
              type: 'chat',
              message: parsedData.message,
              roomId: parsedData.roomId,
              userId: userId,
              timestamp: new Date()
            };

            users.forEach(u => {
              if (u.rooms.includes(parsedData.roomId)) {
                u.ws.send(JSON.stringify(messageToSend));
              }
            });
            break;
        }
      } catch (error) {
        console.error("Error processing message:", error);
        ws.send(JSON.stringify({ error: "Failed to process message" }));
      }
    });

    // Handle disconnection
    ws.on('close', () => {
      const index = users.findIndex(u => u.ws === ws);
      if (index > -1) {
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


