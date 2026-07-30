const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

const createOrder = async (req, res) => {
  try {
    const { amount } = req.body; // Amount comes from the frontend

    const options = {
      amount: amount * 100, // Razorpay strictly works in paise (₹1 = 100 paise)
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

module.exports = { createOrder };