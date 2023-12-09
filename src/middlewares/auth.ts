import { Request, Response, NextFunction } from 'express';
import jwt, { VerifyErrors, JwtPayload } from 'jsonwebtoken';

const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.header('Authorization')?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized - Missing token' });
    }

    jwt.verify(
        token,
        process.env.JWT_SECRET_KEY || 'DEFAULT_SECRET',
        (err: VerifyErrors | null, decoded: object | string | undefined) => {
            if (err) {
                return res.status(403).json({ error: 'Forbidden - Invalid token' });
            }

            if (typeof decoded !== 'object') {
                return res.status(403).json({ error: 'Forbidden - Invalid token' });
            }

            req.user = {
                userId: (decoded as JwtPayload).userId,
                email: (decoded as JwtPayload).email,
                role: (decoded as JwtPayload).role,
            };

            next();
        }
    )
};


const isAdmin = (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    if (!user || !user.role) {
        return res.status(403).json({ error: 'Forbidden - Admin role required' });
    }

    const { role } = user;

    if (role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden - Admin role required' });
    }

    next();
};
export {
    authenticateToken,
    isAdmin
}
