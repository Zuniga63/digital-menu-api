import { Router } from 'express';
import {
  destroy,
  index,
  show,
  store,
  update,
  updateImage,
  removeImage,
} from '../controllers/Product.controller';
import formData from '../middlewares/formData';

const router = Router();

router.route('/').get(index);
router.route('/').post(formData, store);
router.route('/:productId').get(show);
router.route('/:productId').put(formData, update);
router.route('/:productId').delete(destroy);
router.route('/:productId/update-image').put(formData, updateImage);
router.route('/:productId/remove-image').delete(removeImage);

export default router;
