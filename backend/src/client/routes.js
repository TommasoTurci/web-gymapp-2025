import express from 'express';
import * as client from './controller.js';
import { verifyToken, checkRole } from '../index.js';

const router = express.Router();

router.post('/', verifyToken, checkRole('owner'), client.createClient);
router.post('/subscribe', verifyToken, checkRole('client'), client.subscribeToGym);
router.get('/user/profile', verifyToken, checkRole('client'), client.getClientByUserId);
router.get('/user/current-gym', verifyToken, checkRole('client'), client.getCurrentGym);
router.get('/:id', verifyToken, client.getClient);
router.put('/subscription', verifyToken, checkRole('owner'), client.updateClientSubscription);
router.put('/trainer', verifyToken, checkRole('owner'), client.assignTrainer);
router.put('/revoke-trainer', verifyToken, checkRole('owner'), client.revokeTrainer);
router.get('/gym/:gym_id', verifyToken, checkRole('owner'), client.getGymClients);
router.delete('/:id', verifyToken, checkRole('owner'), client.deleteClient);

export default router;
