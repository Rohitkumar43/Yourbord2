// import axios from "axios";

// import { BACKEND_URL  } from "../../../../config";


// async function getroom(slug: string) {
//     const res = await axios.get(`${BACKEND_URL}/room/${slug}`);
//     return res.data.id;
// }



// export default async function  chatRoom({params}: {
//     params: {
//         slug: string;
//     }
// }){
//     const slug = params.slug;
//     const roomId = await getroom(slug);

//     return (
//         <div>
//             <h1>Room: {slug}</h1>
//             <p>Room ID: {roomId}</p>
//         </div>
//     );

// }


import axios from "axios";
import { BACKEND_URL } from "../../../../config";

async function getRoom(slug: string) {
    try {
        const res = await axios.get(`${BACKEND_URL}/room/${slug}`);
        return res.data.id;
    } catch (error) {
        console.error('Error fetching room:', error);
        return null;
    }
}

interface PageProps {
    params: {
        slug: string;
    }
}

export default async function ChatRoom({ params }: PageProps) {
    // Destructure slug from params
    const { slug } = params;
    const roomId = await getRoom(slug);

    if (!roomId) {
        return (
            <div className="p-4">
                <h1>Room not found</h1>
            </div>
        );
    }

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold">Room: {slug}</h1>
            <p className="mt-2">Room ID: {roomId}</p>
        </div>
    );
}