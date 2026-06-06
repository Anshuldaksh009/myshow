const router = require('express').Router();
const bookingController = require('../controllers/bookingController');
const authMiddleware = require('../middlewares/authMiddleware');
const validateId = require('../middlewares/validateId');

// To place a booking, you must be logged in
router.post('/make-booking', authMiddleware, bookingController.makeBooking);
// To cancel a ticket, the user must provide a valid bookingId and be logged in
router.post('/cancel-booking', validateId, authMiddleware, bookingController.cancelBooking);
module.exports = router;