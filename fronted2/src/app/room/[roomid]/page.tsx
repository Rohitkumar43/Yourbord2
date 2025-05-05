
import RoomCanvas from '@/components/RoomCanvas';
import { error } from 'console';

export default function RoomPage({params}: {
  params: {
    roomid: string;  // Changed from roomId to roomid to match directory name  // Changed from roomId to roomid to match directory name  // Changed from roomId to roomid to match directory name
  };
}) {
  // Ensure roomId is properly passed from the URL parameter
  const roomId =params.roomid;  // Changed from params.roomId to params.roomidom ID from URL:", roomId  // Changed from params.roomId to params.roomidom ID from URL:", roomId);
if (!roomId) {
    return <div>Invalid Room ID</div>;
  }

  return <RoomCanvas roomId={roomId} />;
}