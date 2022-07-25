import { Router } from 'express';
import { signUp, signIn } from '../controllers/Auth.controller';

const router = Router();

router.route('/local/signup').post(signUp);
router.route('/local/signin').post(signIn);

export default router;
