'use client';

import RoomCards from '@/components/RoomCards';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RoomsPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      router.push('/signin');
    } else {
      setIsAuthenticated(true);
    }
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isAuthenticated === false) {
    return null; // Will redirect to signin
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Your Drawing Rooms</h1>
      <p className="text-gray-600 mb-8">
        Access your previously created rooms or create a new one to start collaborating.
      </p>
      
      <RoomCards />
    </div>
  );
}