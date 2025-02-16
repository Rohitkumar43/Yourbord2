import axios from "axios";

import { BACKEND_URL } from "../../../config";
import ChatRoomClient from "./ClientChatRoom";

async function getchats(roomId: string) {
    const res = await axios.get(`${BACKEND_URL}/chats/${roomId}`);
    return res.data.messages;
}



export default async function  chatRoom({id}: {
    id: string;
}){
    //const roomId = id;
    const messages = await getchats(id); // it is basically the room id wwe can cosnider it as the room id
    return <ChatRoomClient id={id} messages={messages} />
}




