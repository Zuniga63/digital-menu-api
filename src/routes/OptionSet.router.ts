import { Router } from 'express';
import {
  list,
  store,
  show,
  update,
  destroy,
} from '../controllers/OptionSet.controller';

const router = Router();

router.route('/').get(list);
router.route('/').post(store);
router.route('/:setId').get(show);
router.route('/:setId').put(update);
router.route('/:setId').delete(destroy);

export default router;
