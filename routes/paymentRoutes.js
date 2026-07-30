const express = require('express');
const router = express.Router();
const { createOrder } = require('../controllers/paymentController.js');
const authMiddleware = require('../middlewares/authMiddleware.js');

// We protect this route so only logged-in users can create an order
router.post('/create-order', authMiddleware, createOrder);

module.exports = router;