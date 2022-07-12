import { Router } from 'express';
import AuthRouter from './Auth.router';
import ProductCategoryRouter from './ProductCategory.router';
import ProductRouter from './Product.router';

const rootRouter = Router();

rootRouter.use('/auth', AuthRouter);
rootRouter.use('/product-categories', ProductCategoryRouter);
rootRouter.use('/products', ProductRouter);

export default rootRouter;
