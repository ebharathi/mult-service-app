import { Response, NextFunction } from 'express';
import { decode } from "next-auth/jwt";
import { TokenExpiredError ,JsonWebTokenError} from "jsonwebtoken";

export type AuthenticatedUser = {
        userId: string;
        role: 'ADMIN' | 'OTHER';
        email: string;
        name: string;
        picture?: string;
}


const returnToken = () => {
  if(process.env.NODE_ENV === 'production'){
    return '__Secure-next-auth.session-token';
  }
  return 'next-auth.session-token';
}

export const authMiddleware = async (req: any, res: Response, next: NextFunction) => {
  try {

    // Read JWT token from cookies
    const token = req.cookies[returnToken()];
    if (!token) {
      return res.status(401).json({ error: 'No session token found' });
    }
    const secret = process.env.NEXTAUTH_SECRET;

    if (!secret) {
      console.error('NEXTAUTH_SECRET is not defined');
      return res.status(500).json({ error: 'Server configuration error' });
    }
    const decoded = await decode({
      token: token,
      secret: process.env.NEXTAUTH_SECRET!,
    });
    // console.log("DECODED JWT TOKEN: ",decoded)

    req.user = decoded as AuthenticatedUser;
    req.user.id=decoded?.userId as string
   
    next();
  } catch (error) {
    if (error instanceof JsonWebTokenError) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    if (error instanceof TokenExpiredError) {
      return res.status(401).json({ error: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};
