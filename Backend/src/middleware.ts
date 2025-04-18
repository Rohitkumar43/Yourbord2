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

/**
 * Authentication middleware that verifies JWT tokens
 * @param req Express request object
 * @param res Express response object
 * @param next Express next function
 */
export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  console.log("[AUTH] Checking authorization for request:", req.method, req.path);
  
  // Check the authorization header
  const authHeader = req.headers["authorization"];
  console.log("[AUTH] Authorization header present:", !!authHeader);
  
  if (!authHeader) {
    console.log("[AUTH] No authorization header provided");
    res.status(401).json({
      message: "Authentication required"
    });
    return;
  }

  // Improved token extraction
  const token = authHeader.startsWith('Bearer ') 
    ? authHeader.slice(7) 
    : authHeader;
    
  if (authHeader.startsWith('Bearer ')) {
    console.log("[AUTH] Bearer token format detected, extracted token");
  } else {
    console.log("[AUTH] WARNING: Token doesn't use Bearer format");
  }

  try {
    console.log("[AUTH] Attempting to verify token");
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: number };
    
    console.log("[AUTH] Token verified successfully for userId:", decoded.userId);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    console.error("[AUTH] Token verification failed:", error instanceof Error ? error.message : String(error));
    
    res.status(403).json({
      message: "Invalid or expired token"
    });
  }
}

// Export named function for use in routes
export { authenticateToken as middleware };