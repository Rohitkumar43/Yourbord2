import { request } from 'express';
import { WebSocketServer , WebSocket } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT
const wss = new WebSocketServer({ port: 8080 });

// Here we will make a global state to store the user and the no of rooms the user has joined and rhe msg he has sent
// Also interface for the user

interface User{
  ws: WebSocket;
  userId: string;
  rooms: string[];
}

const users: User[] = [];

// this function will check the user is authenticated or not to join the socket connection
function checkUserAuth(token: string): JwtPayload | null {
  const decode = jwt.verify(token , JWT_SECRET)
  if (!decode || !(decode as JwtPayload).userId) {
    return null;
  }
  return decode as JwtPayload;

} 

wss.on('connection', function connection(ws) {
  // basically in this first it wiil checkk the authoriuxation and then give  the 
  // permission to connnect .....
  const url = request.url; // ws:localhost://30000?token=123123;
  if (!url) {
    return
  }
  const queryParam = new URLSearchParams(url.split('?')['1']);
  const token = queryParam.get("token") || "";
 // now we have to decod this token and the check the user is authenticated or not
  const userAuthenticated = checkUserAuth(token);

  if (userAuthenticated == null){
    ws.send("You are not authenticated");
    ws.close();
    return null;
  }

// now push the data to the user array
users.push({
  userId: userAuthenticated.userId,
  ws,
  rooms: []
})


  ws.on('message', function message(data) {
    // parssse the data 
    const parseData = JSON.parse(data as unknown as string);  // {type: join_room , roomId: 132}

    if(parseData.type === 'join_room'){
      const user = users.find(x => x.ws === ws);
      user?.rooms.push(parseData.roomId);
    }

    // if i want to remove that room 
    if (parseData.type === 'leave_room'){
      const user = users.find(x => x.ws === ws);
      if(!user){
        return;

      }
      user.rooms = user.rooms.filter(x => x === parseData.roomId);
    }

    // if i want to send the message to the room
    if (parseData.type === 'chat') {
      const roomId = parseData.roomId;
      const message = parseData.message;

      users.forEach(user => {
        if (user.rooms.includes(roomId)) {
          user.ws.send(JSON.stringify({
            type: 'chat',
            message: message,
            roomId
          }))
        }
      })
      
    }
  });

  
});