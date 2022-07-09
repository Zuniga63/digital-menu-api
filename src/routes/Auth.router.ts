import { Router } from 'express';
import { signUp } from '../controllers/Auth.controller';

const router = Router();

router.route('/local/signup').post(signUp);

export default router;
