import { request } from 'express';
import { WebSocketServer } from 'ws';
import jwt, { JwtPayload } from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT
const wss = new WebSocketServer({ port: 8080 });

wss.on('connection', function connection(ws) {
  // basically in this first it wiil checkk the authoriuxation and then give  the 
  // permission to connnect .....
  const url = request.url; // ws:localhost://30000?token=123123;
  if (!url) {
    return
  }
  const queryParam = new URLSearchParams(url.split('?')['1']);
  const token = queryParam.get("token") || "";
 // now we have to decod this token and the check the user
 const decode = jwt.verify(token , JWT_SECRET)
 if (!decode || !(decode as JwtPayload).userId) {
  ws.close();
  return;
  
 }

  ws.on('message', function message(data) {
    ws.send('Hello rohit');
  });

  
});