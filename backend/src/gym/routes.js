import express from 'express';
import * as gym from './controller.js';
import { verifyToken, checkRole } from '../index.js';

const router = express.Router();

router.post('/', verifyToken, checkRole('owner'), gym.createGym);
router.get('/all', gym.getAllGyms);
router.get('/:id', verifyToken, gym.getGym);
router.get('/', verifyToken, checkRole('owner'), gym.getOwnerGym);
router.put('/:id', verifyToken, checkRole('owner'), gym.updateGym);

export default router;
