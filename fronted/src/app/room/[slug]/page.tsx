import axios from "axios";

import { BACKEND_URL  } from "../../../../config";


async function getroom(slug: string) {
    const res = await axios.get(`${BACKEND_URL}/room/${slug}`);
    return res.data.id;
}



export default async function  chatRoom({params}: {
    params: {
        slug: string;
    }
}){
    const slug = params.slug;
    const roomId = await getroom(slug);

}
