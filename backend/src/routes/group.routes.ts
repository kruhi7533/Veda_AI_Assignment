import { Router } from 'express';
import {
  createGroup,
  deleteGroup,
  listGroups,
  updateGroup,
} from '../controllers/group.controller';

const router = Router();
router.get('/', listGroups);
router.post('/', createGroup);
router.patch('/:id', updateGroup);
router.delete('/:id', deleteGroup);

export default router;
