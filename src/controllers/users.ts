import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

import UserModel from '../models/users';


const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
        const { name, email, contact, role, password } = req.body;

        const newUser = new UserModel({
            name,
            email,
            contact,
            role,
            password,
        });

        const savedUser = await newUser.save();

        const userWithoutPassword = savedUser.toObject() as any;
        delete userWithoutPassword.password;

        res.status(201).json(userWithoutPassword);
    } catch (error) {
        res.status(500).json({ error: 'Error occurred while creating user .' });
    }
}

const loginUser = async (req: Request, res: Response): Promise<any> => {
    try {
        const { email, password } = req.body;

        const user = await UserModel.findOne({ email });

        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET_KEY || 'DEFAULT_SECRET',
            { expiresIn: '1h' } 
        );

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ error: 'Error occurred while logging in .' });
    }
}

export {
    createUser,
    loginUser
}