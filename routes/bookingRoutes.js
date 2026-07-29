const express = require('express');
const router = express.Router();
const { makeBooking, getUserBookings, cancelBooking } = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/make-booking', authMiddleware, makeBooking);
router.get('/get-user-bookings/:userId', authMiddleware, getUserBookings);
router.post('/cancel-booking', authMiddleware, cancelBooking); // 👈 Added Cancellation Route

module.exports = router;