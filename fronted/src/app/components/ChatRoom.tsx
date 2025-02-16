import axios from "axios";

import { BACKEND_URL } from "../../../config";

async function getchats(roomId: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    return res.data.messages;
}



export default async function  chatRoom({id}: {
    id: string;
}){
    const roomId = id;
    const messages = await getchats(roomId);
    return messages;

}