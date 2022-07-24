import { Router } from 'express';
import AuthRouter from './Auth.router';
import ProductCategoryRouter from './ProductCategory.router';
import ProductRouter from './Product.router';
import OptionSetRouter from './OptionSet.router';
import { home } from '../controllers/ProductCategory.controller';

const rootRouter = Router();

rootRouter.use('/auth', AuthRouter);
rootRouter.use('/product-categories', ProductCategoryRouter);
rootRouter.use('/products', ProductRouter);
rootRouter.use('/option-sets', OptionSetRouter);
rootRouter.route('/home').get(home);

export default rootRouter;
