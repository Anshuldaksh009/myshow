const Booking = require('../models/bookingModel');
const Show = require('../models/showModel');
const redis = require('../config/redis'); // 👈 Import Redis!

// 1. MAKE BOOKING & OCCUPY SEATS (After Payment)
const makeBooking = async (req, res) => {
  let acquiredLocks = []; // Keep track of locks so we can clear them later
  
  try {
    const showId = req.body.showId || req.body.show;
    const selectedSeats = req.body.selectedSeats || req.body.seats;
    const { totalAmount, transactionId } = req.body;

    // 🎯 Use req.user.id attached by your auth middleware
    const userId = req.user?.id || req.user?._id || req.body.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "User ID not found. Please log in again."
      });
    }
    
    if (!showId || !selectedSeats || selectedSeats.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Show ID and selected seats are required."
      });
    }

    // ==========================================
    // 🛡️ STEP 1: REDIS ATOMIC LOCKING
    // ==========================================
    
    // Create unique lock keys for these exact seats (e.g. "lock:show_123:seat_A1")
    const lockKeys = selectedSeats.map(seat => `lock:show_${showId}:seat_${seat}`);

    for (const key of lockKeys) {
      // SET NX = Set if Not eXists, EX 60 = Expire in 60 seconds
      // This is an ATOMIC operation. Only 1 user can succeed at the exact same millisecond.
      const lockAcquired = await redis.set(key, userId, 'NX', 'EX', 60);
      
      if (lockAcquired) {
        acquiredLocks.push(key);
      } else {
        // 🚨 RACE CONDITION AVERTED! 
        // Someone else is booking this seat right now. 
        // Release the locks we *did* manage to get, then tell the user.
        if (acquiredLocks.length > 0) {
          await redis.del(acquiredLocks);
        }
        return res.status(409).json({
          success: false,
          message: "One or more selected seats are currently being booked by someone else. Please try again."
        });
      }
    }

    // ==========================================
    // 💾 STEP 2: MONGODB DATABASE OPERATIONS
    // ==========================================

    // Fetch the specific Show document
    const show = await Show.findById(showId);
    if (!show) {
      // 🧹 Cleanup locks before returning!
      if (acquiredLocks.length > 0) await redis.del(acquiredLocks);
      return res.status(404).json({ success: false, message: "Showtime not found." });
    }

    // Check if any selected seats are already booked for this specific date/show
    const alreadyBooked = selectedSeats.some(seat => show.bookedSeats.includes(seat));
    if (alreadyBooked) {
      // 🧹 Cleanup locks before returning!
      if (acquiredLocks.length > 0) await redis.del(acquiredLocks);
      return res.status(400).json({
        success: false,
        message: "One or more selected seats are already booked. Please choose other seats."
      });
    }

    // Create the Booking Record
    const newBooking = new Booking({
      show: showId,
      user: userId, 
      seats: selectedSeats,
      totalAmount,
      transactionId
    });

    await newBooking.save();

    // 🎯 LOCK SEATS: Push seats into the Show document's bookedSeats array
    await Show.findByIdAndUpdate(showId, {
      $push: { bookedSeats: { $each: selectedSeats } }
    });

    // ==========================================
    // 🧹 STEP 3: CLEANUP & SUCCESS
    // ==========================================
    // The seats are safely in MongoDB, so we can delete the temporary Redis locks!
    if (acquiredLocks.length > 0) {
      await redis.del(acquiredLocks);
    }

    return res.status(201).json({
      success: true,
      message: "Booking confirmed!",
      data: newBooking
    });

  } catch (error) {
    // 🚨 If the server crashes during this process, RELEASE THE LOCKS!
    if (acquiredLocks.length > 0) {
      await redis.del(acquiredLocks);
    }
    console.error("Booking Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 2. GET BOOKINGS FOR LOGGED-IN USER
const getUserBookings = async (req, res) => {
  try {
    let userId;
    if (req.user && req.user._id) userId = req.user._id.toString();
    else if (req.user && req.user.id) userId = req.user.id.toString();
    else if (req.userId) userId = req.userId.toString();

    if (!userId) {
      return res.status(401).json({ success: false, message: "Auth Error: User ID not found." });
    }
    // 🎯 Populate show -> movie and show -> theater
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: 'show',
        populate: [
          { path: 'movie', select: 'title posterUrl duration' },
          { path: 'theater', select: 'name city address' }
        ]
      })
      .sort({ createdAt: -1 }); // Most recent first

    return res.status(200).json({
      success: true,
      data: bookings
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
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

    // B. Check Ownership
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