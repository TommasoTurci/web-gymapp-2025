import express from 'express';
import * as shop from './controller.js';
import { verifyToken, checkRole } from '../index.js';

const router = express.Router();

router.post('/products', verifyToken, checkRole('owner'), shop.createProduct);
router.get('/products/:id', verifyToken, shop.getProduct);
router.get('/gym/:gym_id/products', shop.getGymProducts);
router.put('/products/:id', verifyToken, checkRole('owner'), shop.updateProduct);
router.delete('/products/:id', verifyToken, checkRole('owner'), shop.deleteProduct);

router.post('/orders', verifyToken, checkRole('client'), shop.createOrder);
router.get('/orders', verifyToken, checkRole('client'), shop.getClientOrders);
router.get('/cart', verifyToken, checkRole('client'), shop.getCartOrders);
router.patch('/cart/:id', verifyToken, checkRole('client'), shop.updateCartQuantity);
router.delete('/cart/:id', verifyToken, checkRole('client'), shop.deleteCartItem);
router.post('/purchase', verifyToken, checkRole('client'), shop.purchaseOrders);
router.put('/orders/:id', verifyToken, checkRole('owner'), shop.updateOrderStatus);

export default router;
