import { Router } from 'express';
import {
  destroy,
  index,
  show,
  store,
  update,
  updateImage,
  removeImage,
  addView,
} from '../controllers/Product.controller';
import formData from '../middlewares/formData';

const router = Router();

router.route('/').get(index);
router.route('/').post(formData, store);
router.route('/:slug').get(show);
router.route('/:productId').put(formData, update);
router.route('/:productId').delete(destroy);
router.route('/:productId/update-image').put(formData, updateImage);
router.route('/:productId/remove-image').delete(removeImage);
router.route('/:productId/add-view').put(addView);

export default router;
