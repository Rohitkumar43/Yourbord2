'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { BACKEND_URL } from '../../config';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Room {
  id: number;
  slug: string;
  createdAt: string;
  adminId: number;
  admin?: {
    username: string;
    name: string;
  };
}

export default function RoomCards() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('You must be logged in to view rooms');
          return;
        }

        const response = await axios.get(`${BACKEND_URL}/all-rooms`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data && response.data.rooms) {
          setRooms(response.data.rooms);
        }
      } catch (err) {
        console.error('Error fetching rooms:', err);
        setError('Failed to load rooms. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleCreateRoom = () => {
    router.push('/create-room');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
        <p>{error}</p>
        <button 
          onClick={() => router.push('/signin')}
          className="mt-2 text-sm font-medium text-red-700 underline"
        >
          Sign in
        </button>
      </div>
    );
  }

  return (
    <div className="my-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Your Rooms</h2>
        <button
          onClick={handleCreateRoom}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          Create New Room
        </button>
      </div>

      {rooms.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't created any rooms yet.</p>
          <button
            onClick={handleCreateRoom}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Create Your First Room
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rooms.map((room) => (
            <Link href={`/room/${room.id}`} key={room.id}>
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow bg-white">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{room.slug}</h3>
                  <p className="text-gray-500 text-sm mb-4">
                    Created {new Date(room.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex justify-between items-center">
                    <span className="text-primary-600 font-medium">Open Room</span>
                    <span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                      Room #{room.id}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}