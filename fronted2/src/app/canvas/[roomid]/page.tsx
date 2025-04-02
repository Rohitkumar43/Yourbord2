
import RoomCanvas from '@/components/RoomCanvas';
export default async function canvasPage({params}: {
  params: {
    // this param stored the room  id 
    roomId: string;
  };
}) {

  const roomId = await params.roomId;
  console.log(roomId);


  return <RoomCanvas roomId={params.roomId}/>
  
 
}

