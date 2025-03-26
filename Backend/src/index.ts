import express  from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { CreateUserSchema , RoomNameSchema , signInSchema } from "../schema-types/index";
import {prismaClient} from "../database/src/index";
import cors from "cors";
import { RequestHandler } from 'express';
import { error } from "console";
// interface ChatParams {
//     roomId: string;
// }


interface SignupBody {
    username: string;
    password: string;
    name: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT

const app = express();
app.use(express.json());
app.use(cors());




const signupHandler: RequestHandler<{}, any, SignupBody> = async (req, res) => {
    const parseData = CreateUserSchema.safeParse(req.body);
    
    if (!parseData.success) {
        res.status(400).json({
            message: parseData.error.errors.map(err => ({
                field: err.path.join('.'),
                message: err.message
            }))
        });
        return;
    }
    // if(!parseData.success){
    //     res.status(400).json({
    //         message: parseData.error.message
    //     })
    //     return;
    // } 
    // now we will create the room 
    try {
        const user = await prismaClient.user.create({
            data: {
                email: parseData.data?.username,
                password: parseData.data.password,
                name: parseData.data.name
            }
        });
        res.json({ userId: user.id });
    } catch (error) {
        res.status(411).json({
            message: "User is already registered with this email"
        });
    }
};

app.post('/signup', signupHandler);

app.post("/signin", async (req, res) => {
    const parsedData = signInSchema.safeParse(req.body);
    console.log("Validation result:", parsedData.success);
    if (!parsedData.success) {
        console.log("Validation errors:", parsedData.error.errors);
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }

    // TODO: Compare the hashed pws here
    const user = await prismaClient.user.findFirst({
        where: {
            email: parsedData.data.email,
            password: parsedData.data.password
        }
    })
 // agar user nahi hai toh
    if (!user) {
        res.status(403).json({
            message: "Not authorized"
        })
        return;
    }
    console.log("User found:", user.id);

    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET);
    console.log("User signed in successfully:", user.id);

    res.json({
        token
    })
})

app.post("/room", middleware, async (req, res) => {
    const parsedData = RoomNameSchema.safeParse(req.body);
    console.log(parsedData , error);
    if (!parsedData.success) {
        res.json({
            message: "Incorrect inputs"
        })
        return;
    }
    // @ts-ignore: TODO: Fix this
    const userId = req.userId;

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId
            }
        })

        const data2 = res.json({
            roomId: room.id
        })
        console.log("Room is created" , data2)
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
});


app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
        console.log("Erroor for the room id " , roomId);
        console.log(req.params.roomId);
        const messages = await prismaClient.chatHistory.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });

        res.json({
            messages
        })
    } catch(e) {
        console.log(e);
        res.json({
            messages: []
        })
    }
    
});


// app.get("/chats/:roomId", async (req, res) => {
//     try {
//         const roomId = Number(req.params.roomId);  // Ensure roomId is an integer

//         if (isNaN(roomId)) {
//             return res.status(400).json({ error: "Invalid roomId" });
//         }

//         console.log("Fetching messages for room id:", roomId);

//         const messages = await prismaClient.chatHistory.findMany({
//             where: { roomId },
//             orderBy: { id: "desc" },
//             take: 1000
//         });

//         res.json({ messages });
//     } catch (e) {
//         console.error("Error fetching messages:", e);
//         res.status(500).json({ error: "Internal server error" });
//     }
// });



app.get("/room/:slug" , async (req , res) => {
    const slug = req.query.slug as string;
    const rooms = await prismaClient.room.findMany({
        where: {
            slug
        }
    });
    res.json({
        rooms
    })
})



app.listen(3002);
