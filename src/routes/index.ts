import { Router } from 'express';
import AuthRouter from './Auth.router';
import ProductCategoryRouter from './ProductCategory.router';
import ProductRouter from './Product.router';
import OptionSetRouter from './OptionSet.router';

const rootRouter = Router();

rootRouter.use('/auth', AuthRouter);
rootRouter.use('/product-categories', ProductCategoryRouter);
rootRouter.use('/products', ProductRouter);
rootRouter.use('/set-options', OptionSetRouter);

export default rootRouter;
