 // fteching the data from the backend i.e the existing shape

import axios from "axios";
import { BACKEND_URL } from "../../config";


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
        
        