import { Router } from 'express';
import { createUser, loginUser } from '../controllers/users';

const router = Router();

router.post('/', createUser);
router.post('/login', loginUser)

export default router;