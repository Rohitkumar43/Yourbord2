
import RoomCanvas from '@/components/RoomCanvas';
import { error } from 'console';

export default function RoomPage({params}: {
  params: {
    roomId: string;
  };
}) {
  // Ensure roomId is properly passed from the URL parameter
  const roomId = params.roomId;

  console.log(error);

  
  if (!roomId) {
    return <div>Invalid Room ID</div>;
  }

  return <RoomCanvas roomId={roomId} />;
}