




import React, { useEffect, useState } from 'react'
import { useSocket } from '../hooks/useSocket';

function ClientChatRoom({
    messages,
    id
}: {
    messages: {message: string}[],
    id: string
}) {
    const [chats , setChats] = useState(messages);
    const {socket , loading} = useSocket();
    const [currentMessage , setCurrentMessage] = useState('');


    useEffect(() => {
        if (!loading && socket) {
            socket.send(JSON.stringify({
                type: 'join',
                roomId: id
            }));
            socket.onmessage = (event) => {
                const parsData = JSON.parse(event.data);
                if(parsData.type === 'chat'){
                    setChats([...chats , {message: parsData.message}])
                }
        }
    }
    }, [loading, socket, id , chats])

  return (
    
    <div>
      {chats.map((message, index) => (message
        ? <div key={index}>{message.message}</div>
        : null)
      )}
      <input type="text" onChange={(e) => {
            setCurrentMessage(e.target.value)
      }} value={currentMessage}/><input/>
        <button onClick={() => {
            socket?.send(JSON.stringify({
                type: 'chat',
                roomId: id,
                message: currentMessage
            }))
            setCurrentMessage('')
        }}>Send</button>
    </div>
  )
}

export default ClientChatRoom
