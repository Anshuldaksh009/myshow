const Booking = require('../models/bookingModel');
const Show = require('../models/showModel');

// 1. MAKE BOOKING & OCCUPY SEATS (After Payment)
const makeBooking = async (req, res) => {
  try {
    const { showId, seats, totalAmount, transactionId } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!showId || !seats || seats.length === 0) {
      return res.status(400).send({
        success: false,
        message: 'Show ID and selected seats are required.',
      });
    }

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).send({ success: false, message: 'Show not found.' });
    }

    // Check if any selected seat is ALREADY booked
    const alreadyBooked = seats.some((seat) => show.bookedSeats.includes(seat));
    if (alreadyBooked) {
      return res.status(400).send({
        success: false,
        message: 'One or more selected seats have already been booked by someone else!',
      });
    }

    // Create Booking Record
    const newBooking = new Booking({
      user: userId,
      show: showId,
      seats,
      totalAmount,
      transactionId: transactionId || `TXN_${Date.now()}`,
    });

    await newBooking.save();

    // Mark seats as booked in Show model
    show.bookedSeats = [...show.bookedSeats, ...seats];
    await show.save();

    return res.status(200).send({
      success: true,
      message: 'Booking successful!',
      data: newBooking,
    });
  } catch (error) {
    console.error('Error in makeBooking:', error);
    return res.status(500).send({
      success: false,
      message: error.message || 'Server error processing booking.',
    });
  }
};

// 2. GET BOOKINGS FOR LOGGED-IN USER
const getUserBookings = async (req, res) => {
  try {
    const userId = req.user?._id || req.params.userId;

    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'show',
        populate: ['movie', 'theater'],
      })
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      data: bookings,
    });
  } catch (error) {
    console.error('Error in getUserBookings:', error);
    return res.status(500).send({ success: false, message: error.message });
  }
};

// 3. CANCEL BOOKING & FREE UP SEATS (With Expiration Check)
const cancelBooking = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?._id || req.body.userId;

    if (!bookingId) {
      return res.status(400).send({
        success: false,
        message: 'Booking ID is required.',
      });
    }

    // A. Find Booking
    const booking = await Booking.findById(bookingId).populate('show');
    if (!booking) {
      return res.status(404).send({
        success: false,
        message: 'Booking record not found.',
      });
    }

    // B. Check Ownership (Optional Safety Check)
    if (userId && booking.user.toString() !== userId.toString()) {
      return res.status(403).send({
        success: false,
        message: 'Unauthorized: You can only cancel your own bookings.',
      });
    }

    // C. Check if already cancelled
    if (booking.status === 'CANCELLED') {
      return res.status(400).send({
        success: false,
        message: 'This booking has already been cancelled.',
      });
    }

    // D. ⏰ EXPIRATION CHECK: Ensure show has not already passed
    const show = booking.show;
    if (show && show.date) {
      const showDate = new Date(show.date);
      const now = new Date();

      // If show date is strictly in the past (before today 00:00:00)
      if (showDate < now.setHours(0, 0, 0, 0)) {
        return res.status(400).send({
          success: false,
          message: 'Cannot cancel tickets for a show that has already expired or ended.',
        });
      }
    }

    // E. 🪑 FREE UP SEATS: Remove booked seats from the Show document
    if (show) {
      await Show.findByIdAndUpdate(show._id, {
        $pull: { bookedSeats: { $in: booking.seats } },
      });
    }

    // F. Update Booking Status to CANCELLED
    booking.status = 'CANCELLED';
    await booking.save();

    return res.status(200).send({
      success: true,
      message: '🎟️ Booking cancelled successfully! Seats are now freed up.',
      data: booking,
    });
  } catch (error) {
    console.error('Error in cancelBooking:', error);
    return res.status(500).send({
      success: false,
      message: error.message || 'Server error while cancelling booking.',
    });
  }
};

module.exports = {
  makeBooking,
  getUserBookings,
  cancelBooking,
};