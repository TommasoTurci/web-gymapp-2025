import express from 'express';
import * as subscription from './controller.js';
import { verifyToken, checkRole } from '../index.js';

const router = express.Router();

router.post('/', verifyToken, checkRole('owner'), subscription.createSubscription);
router.get('/:id', verifyToken, subscription.getSubscription);
router.get('/gym/:gym_id', subscription.getGymSubscriptions);
router.put('/:id', verifyToken, checkRole('owner'), subscription.updateSubscription);
router.delete('/:id', verifyToken, checkRole('owner'), subscription.deleteSubscription);

export default router;
