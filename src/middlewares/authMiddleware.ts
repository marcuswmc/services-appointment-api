/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { Request, Response, NextFunction } from "express";

dotenv.config();
const secretKey = process.env.SECRET_KEY || "";

export function checkRole(roles: string[]) {
  return function (req: Request, res: Response, next: NextFunction) {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      res.status(401).json({ error: "Unauthorized. No token provided." });
      return;
    }
    
    try {
      const decodedToken: any = jwt.verify(token, secretKey);
      
      if (!roles.includes(decodedToken.role)) {
        res.status(403).json({ 
          error: "Access forbidden. User does't have the required role", 
        });
        return;
      }

      next();
    } catch (error) {
      res.status(403).json({ 
        error: "Access forbidden. Invalid or expired token." 
      });
      return;
    }
  };
}