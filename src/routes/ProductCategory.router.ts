import { Router } from 'express';
import {
  deleteImage,
  destroy,
  destroyAll,
  list,
  show,
  store,
  update,
  updateImage,
} from '../controllers/ProductCategory.controller';
import formData from '../middlewares/formData';

const router = Router();

router.route('/').get(list);
router.route('/').post(formData, store);
router.route('/').delete(destroyAll);
router.route('/:categoryId').get(show);
router.route('/:categoryId').put(formData, update);
router.route('/:categoryId/update-image').put(formData, updateImage);
router.route('/:categoryId').delete(destroy);
router.route('/:categoryId/delete-image').delete(deleteImage);

export default router;
