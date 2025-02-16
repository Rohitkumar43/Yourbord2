import express  from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { CreateUserSchema , RoomNameSchema , signInSchema } from "../schema-types/index";
import {prismaClient} from "../database/src/index";


const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT

const app = express();
app.use(express.json());


app.post('/signup' , async (req , res  ) => {
    //console.log("Received request body:", req.body);
    const parseData = CreateUserSchema.safeParse(req.body);
    console.log("Validation result:", parseData.success);
    
    if (!parseData.success) {
        console.log("Validation errors:", parseData.error.errors);
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
                password : parseData.data.password,
                name: parseData.data.name
            }
        })
        // connect the DB
        console.log("User created successfully:", user.id);
        res.json({
            userId: user.id
        })
    } catch (error) {
        console.log("Error creating user:", error);
        res.status(411).json({
            message: "User is already registered with this email"
        })
    }
});

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

        res.json({
            roomId: room.id
        })
    } catch(e) {
        res.status(411).json({
            message: "Room already exists with this name"
        })
    }
});


app.get("/chats/:roomId", async (req, res) => {
    try {
        const roomId = Number(req.params.roomId);
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



app.listen(3000);