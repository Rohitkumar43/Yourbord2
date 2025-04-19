

// app.post("/room", middleware, async (req, res) => {
//     const parsedData = RoomNameSchema.safeParse(req.body);
//     console.log(parsedData , error);
//     if (!parsedData.success) {
//         res.json({
//             message: "Incorrect inputs"
//         })
//         return;
//     }
//     // @ts-ignore: TODO: Fix this
//     const userId = req.userId;

//     try {
//         const room = await prismaClient.room.create({
//             data: {
//                 slug: parsedData.data.name,
//                 adminId: userId
//             }
//         })

//         const data2 = res.json({
//             roomId: room.id
//         })
//         console.log("Room is created" , data2)
//     } catch(e) {
//         res.status(411).json({
//             message: "Room already exists with this name"
//         })
//     }
// });


// app.get("/chats/:roomId", async (req, res) => {
//     try {
//         const roomId = Number(req.params.roomId);
//         console.log("Erroor for the room id " , roomId);
//         console.log(req.params.roomId);
//         const messages = await prismaClient.chatHistory.findMany({
//             where: {
//                 roomId: roomId
//             },
//             orderBy: {
//                 id: "desc"
//             },
//             take: 1000
//         });

//         res.json({
//             messages
//         })
//     } catch(e) {
//         console.log(e);
//         res.json({
//             messages: []
//         })
//     }
    
// });


// // app.get("/chats/:roomId", async (req, res) => {
// //     try {
// //         const roomId = Number(req.params.roomId);  // Ensure roomId is an integer

// //         if (isNaN(roomId)) {
// //             return res.status(400).json({ error: "Invalid roomId" });
// //         }

// //         console.log("Fetching messages for room id:", roomId);

// //         const messages = await prismaClient.chatHistory.findMany({
// //             where: { roomId },
// //             orderBy: { id: "desc" },
// //             take: 1000
// //         });

// //         res.json({ messages });
// //     } catch (e) {
// //         console.error("Error fetching messages:", e);
// //         res.status(500).json({ error: "Internal server error" });
// //     }
// // });


import express from 'express';
import cors from 'cors';
import { Request, Response } from 'express';
import { prismaClient } from '../database/src/index';
import { CreateUserSchema, RoomNameSchema, signInSchema } from '../schema-types/index';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { middleware } from './middleware';

// Constants
const JWT_SECRET = process.env.JWT_SECRET ?? "121212";
const PORT = process.env.PORT || 3001;

// Initialize Express app
const app = express();

// Configure middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Authentication routes
app.post("/signup", async (req: Request, res: Response) => {
  try {
    console.log("[SIGNUP] Request body:", req.body);
    const parseData = CreateUserSchema.safeParse(req.body);
    
    if (!parseData.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parseData.error.errors
      });
      return;
    }

    const existingUser = await prismaClient.user.findUnique({
      where: { email: parseData.data.email }
    });

    if (existingUser) {
      res.status(409).json({
        message: "Email already exists"
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(parseData.data.password, 10);
    const user = await prismaClient.user.create({
      data: {
        email: parseData.data.email,
        username: parseData.data.username,
        password: hashedPassword,
        name: parseData.data.username // Using username as name since we're not collecting name separately
      }
    });

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ 
      message: "User created successfully",
      token,
      userId: user.id 
    });
  } catch (error) {
    console.error("[SIGNUP] Error:", error);
    res.status(500).json({
      message: "Error creating user"
    });
  }
});

app.post("/signin", async (req: Request, res: Response) => {
  try {
    console.log("[SIGNIN] Request body:", req.body);
    const parseData = signInSchema.safeParse(req.body);
    
    if (!parseData.success) {
      res.status(400).json({
        message: "Validation failed",
        errors: parseData.error.errors
      });
      return;
    }

    const user = await prismaClient.user.findUnique({
      where: { email: parseData.data.email }
    });

    if (!user) {
      res.status(401).json({
        message: "Invalid email or password"
      });
      return;
    }

    const isPasswordValid = await bcrypt.compare(parseData.data.password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({
        message: "Invalid email or password"
      });
      return;
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

    res.json({
      message: "Login successful",
      token,
      userId: user.id
    });
  } catch (error) {
    console.error("[SIGNIN] Error:", error);
    res.status(500).json({
      message: "Error during sign in"
    });
  }
});

// Protected routes - all routes below this require authentication
app.post("/room", middleware, async (req: Request, res: Response) => {
    console.log("[ROOM CREATE] Received room creation request:", JSON.stringify(req.body));
    
    const parsedData = RoomNameSchema.safeParse(req.body);
    
    if (!parsedData.success) {
        console.log("[ROOM CREATE] Validation failed:", JSON.stringify(parsedData.error.errors));
        res.status(400).json({
            message: "Incorrect inputs",
            errors: parsedData.error.errors
        });
        return;
    }
    
    const userId = req.userId;
    console.log(`[ROOM CREATE] Creating room with name: ${parsedData.data.name} for user: ${userId}`);

    try {
        const room = await prismaClient.room.create({
            data: {
                slug: parsedData.data.name,
                adminId: userId as number
            }
        });

        console.log("[ROOM CREATE] Room created successfully with ID:", room.id);
        res.json({
            roomId: room.id
        });
    } catch(e) {
        console.error("[ROOM CREATE] Error creating room:", e);
        res.status(411).json({
            message: "Room already exists with this name",
            error: e instanceof Error ? e.message : String(e)
        });
    }
});





// api for the forget passwor==================================================================

//Fix the /chats/:roomId GET endpoint with proper typing
app.get("/chats/:roomId", async (req: Request, res: Response) => {
    const roomId = Number(req.params.roomId);
    console.log(`[CHAT HISTORY] Fetching messages for room ID: ${roomId}`);

    if (isNaN(roomId)) {
        console.log("[CHAT HISTORY] Invalid roomId format");
        return res.status(400).json({ error: "Invalid roomId format" });
    }

    try {
        console.log(`[CHAT HISTORY] Finding messages for room ID: ${roomId}`);
        const messages = await prismaClient.chatHistory.findMany({
            where: {
                roomId: roomId
            },
            orderBy: {
                id: "desc"
            },
            take: 1000
        });

        console.log(`[CHAT HISTORY] Found ${messages.length} messages for room ID: ${roomId}`);
        res.json({
            messages
        });
    } catch(e) {
        console.error("[CHAT HISTORY] Error fetching messages:", e);
        res.status(500).json({
            message: "Failed to fetch messages",
            error: e instanceof Error ? e.message : String(e)
        });
    }
});

// Fix the /room/:slug GET endpoint with proper typing
app.get("/room/:slug", async (req: Request, res: Response) => {
    const slug = req.params.slug;
    console.log(`[ROOM LOOKUP] Looking up room with slug: ${slug}`);
    
    try {
        const rooms = await prismaClient.room.findMany({
            where: {
                slug
            }
        });
        
        console.log(`[ROOM LOOKUP] Found ${rooms.length} rooms with slug: ${slug}`);
        res.json({
            rooms
        });
    } catch (e) {
        console.error("[ROOM LOOKUP] Error looking up room:", e);
        res.status(500).json({
            message: "Failed to lookup room",
            error: e instanceof Error ? e.message : String(e)
        });
    }
});




const port = process.env.PORT || 3004;
app.listen(port, () => {
    console.log(`[SERVER] Server started on port ${port}`);
});


