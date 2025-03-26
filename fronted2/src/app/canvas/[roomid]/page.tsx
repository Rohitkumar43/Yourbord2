
import RoomCanvas from '@/components/RoomCanvas';
export default async function canvasPage({params}: {
  params: {
    roomId: string;
  };
}) {

  const roomId = await params.roomId;
  console.log(roomId);


  return <RoomCanvas roomId={params.roomId}/>
  
 
}

