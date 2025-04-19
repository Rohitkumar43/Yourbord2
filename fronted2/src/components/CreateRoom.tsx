'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateRoom() {
  const [roomName, setRoomName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!roomName.trim()) {
      setError('Room name cannot be empty');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Using your actual API endpoint for room creation
      const response = await fetch('/api/room', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Include authorization if you're using JWT
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ name: roomName }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create room');
      }
      
      const data = await response.json();
      
      console.log('Room created successfully:', data);
      // Redirect to the room with the returned roomId
      router.push(`/room/${data.roomId}`);
    } catch (err) {
      console.error('Error creating room:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-8">Create a New Whiteboard Room</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label htmlFor="roomName" className="block text-gray-700 text-sm font-bold mb-2">
              Room Name
            </label>
            <input
              id="roomName"
              type="text"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Enter room name"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              disabled={isLoading}
            />
          </div>
          
          <div className="flex items-center justify-center">
            <button
              type="submit"
              className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full ${
                isLoading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isLoading}
            >
              {isLoading ? 'Creating...' : 'Create Room'}
            </button>
          </div>
        </form>
        
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Create a room to start collaborating on a whiteboard with others.
          </p>
        </div>
      </div>
    </div>
  );
}