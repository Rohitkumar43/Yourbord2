 // fteching the data from the backend i.e the existing shape

import axios from "axios";
import { BACKEND_URL } from "../../config";


        // the shape we will get which is draw pahle se 
        export async function getExistingShapes(roomId: string) {
            try {
                console.log(`Fetching existing shapes for room ${roomId}`);
                const response = await axios.get(`${BACKEND_URL}/room/id/slug/${roomId}`);
                const messages = response.data.messages;
        
                if(!messages || !messages.length) {
                    console.log('No existing shapes found');
                    return [];
                }
        
                console.log(`Found ${messages.length} messages with shapes`);
                
                // Map over the data and return the shapes
                const shapes = messages.map((x : {message: string}) => {
                    try {
                        const parsed = JSON.parse(x.message);
                        return parsed;
                    } catch (e) {
                        console.error('Error parsing message:', e);
                        return null;
                    }
                }).filter(Boolean); // Remove any null values
                
                console.log(`Successfully parsed ${shapes.length} shapes`);
                return shapes;
                
            } catch (error) {
                console.error('Error fetching existing shapes:', error);
                return [];
            }
        }
        
        