const express = require('express');
const { createOrder, cancelLock } = require('../controllers/paymentController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

// Notice we pass authMiddleware so req.user._id exists!
router.post('/create-order', authMiddleware, createOrder); 
router.post('/cancel-lock', authMiddleware, cancelLock);

module.exports = router;