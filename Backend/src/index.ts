// import express , { Request, Response , NextFunction} from "express";
// import jwt from "jsonwebtoken";
// import { middleware } from "./middleware";
// import { CreateUserSchema , RoomNameSchema , signInSchema } from "../schema-types/index";
// import {prismaClient} from "../database/src/index";
// import cors from "cors";
// import { RequestHandler } from 'express';
// import { error } from "console";
// import bcrypt from "bcrypt";
// // interface ChatParams {
// //     roomId: string;
// // }


// interface SignupBody {
//     username: string;
//     password: string;
//     name: string;
// }

// const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT

// const app = express();
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(cors());




// // const signupHandler: RequestHandler<{}, any, SignupBody> = async (req, res) => {
// //     const parseData = CreateUserSchema.safeParse(req.body);
    
// //     if (!parseData.success) {
// //         res.status(400).json({
// //             message: parseData.error.errors.map(err => ({
// //                 field: err.path.join('.'),
// //                 message: err.message
// //             }))
// //         });
// //         return;
// //     }
// //     // if(!parseData.success){
// //     //     res.status(400).json({
// //     //         message: parseData.error.message
// //     //     })
// //     //     return;
// //     // } 
// //     // now we will create the room 
// //     try {
// //         const user = await prismaClient.user.create({
// //             data: {
// //                 username: parseData.data?.username,
// //                 password: parseData.data.password,
// //                 name: parseData.data.name
// //             }
// //         });
// //         res.json({ userId: user.id });
// //     } catch (error) {
// //         res.status(411).json({
// //             message: "User is already registered with this email"
// //         });
// //     }
// // };

// // app.post('/signup', signupHandler);

// // app.post("/signin", async (req, res) => {
// //     const parsedData = signInSchema.safeParse(req.body);
// //     console.log("Validation result:", parsedData.success);
// //     if (!parsedData.success) {
// //         console.log("Validation errors:", parsedData.error.errors);
// //         res.json({
// //             message: "Incorrect inputs"
// //         })
// //         return;
// //     }

// //     // TODO: Compare the hashed pws here
// //     const user = await prismaClient.user.findFirst({
// //         where: {
// //             username: parsedData.data.username,
// //             password: parsedData.data.password
// //         }
// //     })
// //  // agar user nahi hai toh
// //     if (!user) {
// //         res.status(403).json({
// //             message: "Not authorized"
// //         })
// //         return;
// //     }
// //     console.log("User found:", user.id);

// //     const token = jwt.sign({
// //         userId: user?.id
// //     }, JWT_SECRET);
// //     console.log("User signed in successfully:", user.id);

// //     res.json({
// //         token
// //     })
// // })


// // Define the request body type
// interface SignInRequestBody {
//     username: string;
//     password: string;
// }


// const signupHandler: RequestHandler<{}, any, SignupBody> = async (req, res) => {
//     console.log("Received signup request with body:", req.body); // Log request body

//     const parseData = CreateUserSchema.safeParse(req.body);
    
//     if (!parseData.success) {
//         console.log("Validation failed:", parseData.error.errors); // Log validation errors
//         res.status(400).json({
//             message: parseData.error.errors.map(err => ({
//                 field: err.path.join('.'),
//                 message: err.message
//             }))
//         });
//         return;
//     }

//     try {
//         console.log("Validation successful, checking if username exists...");

//         // Check if username already exists
//         const existingUser = await prismaClient.user.findUnique({
//             where: { username: parseData.data.username } // Ensure 'username' is unique in the schema
//         });

//         if (existingUser) {
//             console.log("Username already exists:", parseData.data.username);
//             res.status(409).json({
//                 message: "Username already exists"
//             });
//             return;
//         }

//         console.log("Username is available, hashing password...");
//         // Hash the password
//         const hashedPassword = await bcrypt.hash(parseData.data.password, 10);
//         console.log("Password hashed successfully.");

//         console.log("Creating user in database...");
//         const user = await prismaClient.user.create({
//             data: {
//                 username: parseData.data.username,
//                 password: hashedPassword,
//                 name: parseData.data.name
//             }
//         });

//         console.log("User created successfully with ID:", user.id);
//         res.status(201).json({ userId: user.id });
//     } catch (error) {
//         console.error("Signup error:", error);
//         res.status(500).json({
//             message: "Error creating user"
//         });
//     }
// };


// app.post('/signup', signupHandler);

// // app.post("/signin", async (req: Request<{}, {} , SignInRequestBody>, res: Response , next: NextFunction) => {

//     const signInHandler: RequestHandler<{}, any, SignInRequestBody> = async (req, res): Promise<void> => {    

//     const parsedData = signInSchema.safeParse(req.body);
    
//     if (!parsedData.success) {
//         res.status(400).json({
//             message: "Incorrect inputs",
//             errors: parsedData.error.errors
//         });
//         return;
//     }

//     try {
//         const user = await prismaClient.user.findFirst({
//             where: { username: parsedData.data.username }
//         });

//         if (!user) {
//             res.status(401).json({
//                 message: "Invalid username or password"
//             });
//             return;
//         }

//         // Compare passwords using bcrypt
//         const isPasswordValid = await bcrypt.compare(
//             parsedData.data.password, 
//             user.password
//         );

//         if (!isPasswordValid) {
//             res.status(401).json({
//                 message: "Invalid username or password"
//             });
//             return;
//         }

//         const token = jwt.sign(
//             { userId: user.id }, 
//             JWT_SECRET, 
//             { expiresIn: '24h' }
//         );

//         res.json({
//             token,
//             userId: user.id
//         });
//     } catch (error) {
//         console.error("Signin error:", error);
//         res.status(500).json({
//             message: "Server error during sign in"
//         });
//     }
// };

// app.post('/signin' , signInHandler);


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



// app.get("/room/:slug" , async (req , res) => {
//     const slug = req.query.slug as string;
//     const rooms = await prismaClient.room.findMany({
//         where: {
//             slug
//         }
//     });
//     res.json({
//         rooms
//     })
// })



// app.listen(3004);


import express, { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { middleware } from "./middleware";
import { CreateUserSchema, RoomNameSchema, signInSchema } from "../schema-types/index";
import { prismaClient } from "../database/src/index";
import cors from "cors";
import { RequestHandler } from 'express';
import { error } from "console";
import bcrypt from "bcrypt";

interface SignupBody {
    username: string;
    password: string;
    name: string;
}

interface SignInRequestBody {
    username: string;
    password: string;
}

const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT
console.log(`[CONFIG] JWT_SECRET ${process.env.JWT_SECRET ? 'loaded from env' : 'using fallback'}`);

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Add request logging middleware
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// const signupHandler: RequestHandler<{}, any, SignupBody> = async (req, res) => {
//     console.log("[SIGNUP] Received signup request with body:", JSON.stringify(req.body));

//     const parseData = CreateUserSchema.safeParse(req.body);
    
//     if (!parseData.success) {
//         console.log("[SIGNUP] Validation failed:", JSON.stringify(parseData.error.errors));
//         res.status(400).json({
//             message: parseData.error.errors.map(err => ({
//                 field: err.path.join('.'),
//                 message: err.message
//             }))
//         });
//         return;
//     }

//     try {
//         console.log("[SIGNUP] Validation successful, checking if username exists...");

//         const existingUser = await prismaClient.user.findUnique({
//             where: { username: parseData.data.username }
//         });

//         if (existingUser) {
//             console.log("[SIGNUP] Username already exists:", parseData.data.username);
//             res.status(409).json({
//                 message: "Username already exists"
//             });
//             return;
//         }

//         console.log("[SIGNUP] Username is available, hashing password...");
//         const hashedPassword = await bcrypt.hash(parseData.data.password, 10);
//         console.log("[SIGNUP] Password hashed successfully.");

//         console.log("[SIGNUP] Creating user in database...");
//         const user = await prismaClient.user.create({
//             data: {
//                 username: parseData.data.username,
//                 password: hashedPassword,
//                 name: parseData.data.name
//             }
//         });

//         console.log("[SIGNUP] User created successfully with ID:", user.id);
//         res.status(201).json({ userId: user.id });
//     } catch (error) {
//         console.error("[SIGNUP] Error creating user:", error);
//         res.status(500).json({
//             message: "Error creating user",
//             error: error instanceof Error ? error.message : String(error)
//         });
//     }
// };

// app.post('/signup', signupHandler);

// const signInHandler: RequestHandler<{}, any, SignInRequestBody> = async (req, res) => {    
//     console.log("[SIGNIN] Received signin request for username:", req.body.username);

//     const parsedData = signInSchema.safeParse(req.body);
    
//     if (!parsedData.success) {
//         console.log("[SIGNIN] Validation failed:", JSON.stringify(parsedData.error.errors));
//         res.status(400).json({
//             message: "Incorrect inputs",
//             errors: parsedData.error.errors
//         });
//         return;
//     }

//     try {
//         console.log("[SIGNIN] Looking up user:", parsedData.data.username);
//         const user = await prismaClient.user.findFirst({
//             where: { username: parsedData.data.username }
//         });

//         if (!user) {
//             console.log("[SIGNIN] User not found:", parsedData.data.username);
//             res.status(401).json({
//                 message: "Invalid username or password"
//             });
//             return;
//         }

//         console.log("[SIGNIN] User found, comparing passwords");
//         const isPasswordValid = await bcrypt.compare(
//             parsedData.data.password, 
//             user.password
//         );

//         if (!isPasswordValid) {
//             console.log("[SIGNIN] Password invalid for user:", parsedData.data.username);
//             res.status(401).json({
//                 message: "Invalid username or password"
//             });
//             return;
//         }

//         console.log("[SIGNIN] Password valid, generating token");
//         const token = jwt.sign(
//             { userId: user.id }, 
//             JWT_SECRET, 
//             { expiresIn: '24h' }
//         );

//         console.log("[SIGNIN] Login successful for user ID:", user.id);
//         res.json({
//             token,
//             userId: user.id
//         });
//     } catch (error) {
//         console.error("[SIGNIN] Signin error:", error);
//         res.status(500).json({
//             message: "Server error during sign in",
//             error: error instanceof Error ? error.message : String(error)
//         });
//     }
// };

// app.post('/signin', signInHandler);

// Fix the /room POST endpoint with proper typing




// Signup endpoint

// Signup endpoint
app.post('/signup', (req, res) => {
    (async () => {
        try {
            console.log("[SIGNUP] Request body:", req.body);
            const parseData = CreateUserSchema.safeParse(req.body);
            
            if (!parseData.success) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: parseData.error.errors
                });
            }

            const existingUser = await prismaClient.user.findUnique({
                where: { email: parseData.data.email}
            });

            if (existingUser) {
                return res.status(409).json({
                    message: "email already exists"
                });
            }

            const hashedPassword = await bcrypt.hash(parseData.data.password, 10);
            const user = await prismaClient.user.create({
                data: {
                    email: parseData.data.email,
                    username: parseData.data.username,
                    password: hashedPassword,
                    name: parseData.data.name
                }
            });

            const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });

            return res.status(201).json({ 
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
    })();
});

// Signin endpoint
app.post('/signin', (req, res) => {
    (async () => {
        try {
            const parseData = signInSchema.safeParse(req.body);
            
            if (!parseData.success) {
                return res.status(400).json({
                    message: "Validation failed",
                    errors: parseData.error.errors
                });
            }

            const user = await prismaClient.user.findUnique({
                where: { email: parseData.data.username }
            });

            if (!user) {
                return res.status(401).json({
                    message: "Invalid username or password"
                });
            }

            // Fix: bcrypt.compare instead of bcrypt.hash for password checking
            const isPasswordValid = await bcrypt.compare(parseData.data.password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    message: "Invalid username or password"
                });
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
    })();
});



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

// Fix the /chats/:roomId GET endpoint with proper typing
// app.get("/chats/:roomId", async (req: Request, res: Response) => {
//     const roomId = Number(req.params.roomId);
//     console.log(`[CHAT HISTORY] Fetching messages for room ID: ${roomId}`);

//     if (isNaN(roomId)) {
//         console.log("[CHAT HISTORY] Invalid roomId format");
//         return res.status(400).json({ error: "Invalid roomId format" });
//     }

//     try {
//         console.log(`[CHAT HISTORY] Finding messages for room ID: ${roomId}`);
//         const messages = await prismaClient.chatHistory.findMany({
//             where: {
//                 roomId: roomId
//             },
//             orderBy: {
//                 id: "desc"
//             },
//             take: 1000
//         });

//         console.log(`[CHAT HISTORY] Found ${messages.length} messages for room ID: ${roomId}`);
//         res.json({
//             messages
//         });
//     } catch(e) {
//         console.error("[CHAT HISTORY] Error fetching messages:", e);
//         res.status(500).json({
//             message: "Failed to fetch messages",
//             error: e instanceof Error ? e.message : String(e)
//         });
//     }
// });

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



// Add a basic healthcheck endpoint for testing connectivity
app.get("/health", (req, res) => {
    console.log("[HEALTH] Health check requested");
    res.status(200).json({ 
        status: "ok",
        timestamp: new Date().toISOString(),
        database: "connected" // You could add a real DB check here
    });
});

const port = process.env.PORT || 3004;
app.listen(port, () => {
    console.log(`[SERVER] Server started on port ${port}`);
});


