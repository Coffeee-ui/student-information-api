import { Router } from 'express';
import { getStudents, getStudentById, createStudent, updateStudent, deleteStudent } from '../controllers/studentControllers.js';
const router = Router();
// Database-backed GET and POST routes from previous lessons
router.get('/', getStudents);
router.get('/:id', getStudentById);
router.post('/', createStudent);
// New Chapter 3.3 PUT and DELETE routes
router.put('/:id', updateStudent);
router.delete('/:id', deleteStudent);
export default router;
//# sourceMappingURL=studentRoutes.js.map