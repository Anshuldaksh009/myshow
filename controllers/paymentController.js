const Razorpay = require('razorpay');
// 🚨 Import your Redis client (Make sure the path matches your folder structure!)
const redisClient = require('../config/redis'); 

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    // We now request showId and seats from the frontend to lock them
    const { amount, showId, seats } = req.body; 
    const userId = req.user._id.toString();

    // 1. Array to track seats we successfully locked, in case we need to rollback
    const lockedSeats = [];

    // 2. Try to lock EVERY seat requested
    for (let seat of seats) {
      const lockKey = `lock:show:${showId}:seat:${seat}`;
      
      // NX: Only set if Not eXists | EX: Expire lock in 600 seconds (10 mins)
      const acquired = await redisClient.set(lockKey, userId, {
        NX: true,
        EX: 600
      });

      if (!acquired) {
        // CONCURRENCY ROLLBACK: If we fail to lock this seat, release any seats we ALREADY locked
        for (let lockedSeat of lockedSeats) {
          await redisClient.del(`lock:show:${showId}:seat:${lockedSeat}`);
        }
        return res.status(400).json({ 
          success: false, 
          message: `Seat ${seat} is currently being booked by another user. Please select a different seat.` 
        });
      }
      
      lockedSeats.push(seat);
    }

    // 3. If ALL locks succeeded, create the Razorpay order
    const options = {
      amount: amount * 100, // ₹1 = 100 paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };
    
    const order = await razorpay.orders.create(options);
    
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Razorpay Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// 4. NEW: Function to release locks if the user closes the payment popup
const cancelLock = async (req, res) => {
  try {
    const { showId, seats } = req.body;
    for (let seat of seats) {
      await redisClient.del(`lock:show:${showId}:seat:${seat}`);
    }
    return res.status(200).json({ success: true, message: "Seat locks released." });
  } catch (error) {
    console.error("Lock Release Error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { createOrder, cancelLock };