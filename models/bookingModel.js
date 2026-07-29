const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    show: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'shows',
      required: true,
    },
    seats: {
      type: [String],
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    transactionId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['BOOKED', 'CANCELLED'],
      default: 'BOOKED',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('bookings', bookingSchema);