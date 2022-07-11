import { Router } from 'express';
import AuthRouter from './Auth.router';
import ProductCategoryRouter from './ProductCategory.router';

const rootRouter = Router();

rootRouter.use('/auth', AuthRouter);
rootRouter.use('/product-categories', ProductCategoryRouter);

export default rootRouter;
