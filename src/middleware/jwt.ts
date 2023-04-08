// JWT auth middleware
import { Request, Response, NextFunction } from 'express';
const jwt = require('jsonwebtoken');

export const auth = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header('x-auth-token');

    // Check for token
    if (!token) {
        return res.status(401).json({ message: 'Lütfen tekrar giriş yapınız.' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Add user from payload
        req.headers['userId'] = decoded;

        next();
    } catch (e) {
        res.status(400).json({ message: 'Lütfen tekrar giriş yapınız.' });
    }
}

export type userType = {
    id: string,
    iat: number,
    exp: number
}

module.exports = { auth };