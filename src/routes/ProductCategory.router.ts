import { Router } from 'express';
import {
  list,
  store,
  show,
  update,
  updateImage,
  deleteImage,
  enabledCategory,
  disabledCategory,
  destroy,
  destroyAll,
} from '../controllers/ProductCategory.controller';
import formData from '../middlewares/formData';

const router = Router();

router.route('/').get(list);
router.route('/').post(formData, store);
router.route('/').delete(destroyAll);
router.route('/:categoryId').get(show);
router.route('/:categoryId').put(formData, update);
router.route('/:categoryId/enable').put(enabledCategory);
router.route('/:categoryId/disable').put(disabledCategory);
router.route('/:categoryId/update-image').put(formData, updateImage);
router.route('/:categoryId/delete-image').delete(deleteImage);
router.route('/:categoryId').delete(destroy);

export default router;
