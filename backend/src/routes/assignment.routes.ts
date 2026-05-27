import { Router } from 'express';
import multer from 'multer';
import {
  createAssignment,
  deleteAssignment,
  downloadPdf,
  getAssignment,
  listAssignments,
  regenerateAssignment,
  toggleFavorite,
} from '../controllers/assignment.controller';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});

const router = Router();

router.get('/', listAssignments);
router.post('/', upload.single('file'), createAssignment);
router.get('/:id', getAssignment);
router.delete('/:id', deleteAssignment);
router.post('/:id/regenerate', regenerateAssignment);
router.post('/:id/favorite', toggleFavorite);
router.get('/:id/pdf', downloadPdf);

export default router;
