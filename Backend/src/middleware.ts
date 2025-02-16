import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT

// Extend the Express Request type
interface AuthenticatedRequest extends Request {
    userId?: number;
}

export function middleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    // Check the authorization header
    const token = req.headers["authorization"] ?? "";

    try {
        const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };  // Ensure correct type

        req.userId = decoded.userId; // Assign the userId
        next();
    } catch (error) {
        res.status(403).json({
            message: "Unauthorized access"
        });
    }
}
