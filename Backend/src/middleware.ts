// import { NextFunction, Request, Response } from "express";
// import jwt from "jsonwebtoken";


// const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT

// // Extend the Express Request type
// interface AuthenticatedRequest extends Request {
//     userId?: number;
// }

// export function middleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
//     // Check the authorization header
//     const token = req.headers["authorization"] ?? "";

//     try {
//         const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };  // Ensure correct type

//         req.userId = decoded.userId; // Assign the userId
//         next();
//     } catch (error) {
//         res.status(403).json({
//             message: "Unauthorized access"
//         });
//     }
// }


import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET ?? "121212"; // Secret key for JWT
console.log(`[MIDDLEWARE CONFIG] JWT_SECRET ${process.env.JWT_SECRET ? 'loaded from env' : 'using fallback'}`);

// Extend the Express Request type - use declaration merging for proper TypeScript compatibility
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

export function middleware(req: Request, res: Response, next: NextFunction): void {
  console.log("[AUTH] Checking authorization for request:", req.method, req.path);
  
  // Check the authorization header
  const token = req.headers["authorization"] ?? "";
  console.log("[AUTH] Authorization header present:", !!token);
  
  if (!token) {
    console.log("[AUTH] No token provided in authorization header");
    res.status(403).json({
      message: "Unauthorized access - No token provided"
    });
    return;
  }

  // Improved token extraction
  let tokenValue = token;
  if (token.startsWith('Bearer ')) {
    tokenValue = token.slice(7);
    console.log("[AUTH] Bearer token format detected, extracted token");
  } else {
    console.log("[AUTH] WARNING: Token doesn't use Bearer format");
  }

  try {
    console.log("[AUTH] Attempting to verify token");
    const decoded = jwt.verify(tokenValue, JWT_SECRET) as { userId: number };
    
    console.log("[AUTH] Token verified successfully for userId:", decoded.userId);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("[AUTH] Token verification failed:", error);
    
    res.status(403).json({
      message: "Unauthorized access - Invalid token"
    });
  }
}