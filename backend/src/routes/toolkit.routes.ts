import { Router } from 'express';
import {
  postExplain,
  postLessonPlan,
  postRubric,
} from '../controllers/toolkit.controller';

const router = Router();
router.post('/explain', postExplain);
router.post('/lesson-plan', postLessonPlan);
router.post('/rubric', postRubric);

export default router;
