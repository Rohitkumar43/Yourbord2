import express  from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { CreateUserSchema , RoomNameSchema , signInSchema } from "../schema-types/index";
import {prismaClient} from "../database/src/index";


const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT

const app = express();
app.use(express.json());


app.post('/signup' , async (req , res  ) => {
    const parseData = CreateUserSchema.safeParse(req.body);
    if(!parseData.success){
        res.status(400).json({
            message: parseData.error.message
        })
        return;
    } 
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
        console.log("working ")
        res.json({
            userId: user.id 
        })
    } catch (error) {
        res.status(411).json({
            message: "User is already registered with this email"
        })
    }
});

app.post("/signin", async (req, res) => {
    const parsedData = signInSchema.safeParse(req.body);
    if (!parsedData.success) {
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

    const token = jwt.sign({
        userId: user?.id
    }, JWT_SECRET);

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
})



app.listen(3000);