import { Router } from 'express';
import {
  list,
  store,
  show,
  destroy,
  updateOptionSetName,
  enabledOptionSet,
  disabledOptionSet,
  addItem,
  updateOptionSetItem,
  enabledOptionSetItem,
  disabledOptionSetItem,
  removeImageOfOptionSetItem,
  destroyOptionSetItem,
  listOptionItems,
  sortItems,
} from '../controllers/OptionSet.controller';
import formData from '../middlewares/formData';

const router = Router();

router.route('/').get(list);
router.route('/').post(store);
router.route('/:setId').get(show);
router.route('/:setId/update-name').put(updateOptionSetName);
router.route('/:setId/enabled').put(enabledOptionSet);
router.route('/:setId/disabled').put(disabledOptionSet);
router.route('/:setId/sort-items').put(sortItems);
router.route('/:setId').delete(destroy);

router.route('/:setId/items').get(listOptionItems);
router.route('/:setId/items').post(formData, addItem);
router.route('/:setId/items/:itemId').post(formData, updateOptionSetItem);
router.route('/:setId/items/:itemId/enabled').put(enabledOptionSetItem);
router.route('/:setId/items/:itemId/disabled').put(disabledOptionSetItem);
router.route('/:setId/items/:itemId/remove-image').put(removeImageOfOptionSetItem);
router.route('/:setId/items/:itemId').delete(destroyOptionSetItem);

export default router;
