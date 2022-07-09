import { Router } from 'express';
import AuthRouter from './Auth.router';

const rootRouter = Router();

rootRouter.use('/auth', AuthRouter);

export default rootRouter;
