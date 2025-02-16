'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [roomId, setRoomId] = useState<string>('')
  const router = useRouter()
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 space-y-4">
      <input 
        value={roomId} 
        type='text' 
        placeholder='Room id' 
        className="p-2 border border-gray-300 rounded-md text-base w-full max-w-[300px] text-black"
        onChange={(e) => {
          setRoomId(e.target.value)
        }}
      />
      <button 
        className="p-2 bg-blue-500 text-white rounded-md text-base w-full max-w-[300px] h-12 "
        onClick={() => {
          router.push(`/room/${roomId}`);
        }}

        >Join Room</button>
      <h1 className="text-gray-800 text-center"> Welcome to Next.js App Router</h1>
    </main>
  )
}
