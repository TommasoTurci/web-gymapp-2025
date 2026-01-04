import express from 'express';
import * as exercise from './controller.js';
import { verifyToken, checkRole } from '../index.js';

const router = express.Router();

router.post('/', verifyToken, checkRole('owner', 'trainer'), exercise.createExercise);
router.get('/trainer/my-exercises', verifyToken, checkRole('trainer'), exercise.getTrainerExercises);
router.get('/:id', verifyToken, exercise.getExercise);
router.get('/', verifyToken, exercise.getAllExercises);
router.put('/:id', verifyToken, checkRole('owner', 'trainer'), exercise.updateExercise);
router.delete('/:id', verifyToken, checkRole('owner', 'trainer'), exercise.deleteExercise);
router.post('/assign', verifyToken, checkRole('trainer'), exercise.assignExerciseToClient);
router.get('/client/:client_id', verifyToken, exercise.getClientExercises);
router.delete('/plan/:plan_id', verifyToken, checkRole('trainer'), exercise.deleteClientExercise);

export default router;
