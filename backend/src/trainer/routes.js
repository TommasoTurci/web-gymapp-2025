import express from 'express';
import * as trainer from './controller.js';
import { verifyToken, checkRole } from '../index.js';

const router = express.Router();

router.post('/', verifyToken, checkRole('owner'), trainer.createTrainer);
router.get('/user/profile', verifyToken, checkRole('trainer'), trainer.getTrainerByUserId);
router.get('/user/gym', verifyToken, checkRole('trainer'), trainer.getTrainerGym);
router.get('/available', verifyToken, checkRole('owner'), trainer.getAvailableTrainers);
router.get('/gym/:gym_id/available', verifyToken, checkRole('owner'), trainer.getAvailableGymTrainers);
router.get('/:id', verifyToken, trainer.getTrainer);
router.get('/gym/:gym_id', verifyToken, checkRole('owner'), trainer.getGymTrainers);
router.get('/user/clients', verifyToken, checkRole('trainer'), trainer.getTrainerClients);
router.put('/assign-to-gym', verifyToken, checkRole('owner'), trainer.assignTrainerToGym);
router.put('/:id/specialization', verifyToken, checkRole('owner'), trainer.updateTrainerSpecialization);
router.put('/:user_id/remove-from-gym', verifyToken, checkRole('owner'), trainer.removeTrainerFromGym);

export default router;
