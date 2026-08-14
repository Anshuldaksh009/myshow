const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  name: { type: String, required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'movies', required: true, index: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'theaters', required: true, index: true },
  date: { type: Date, required: true, index: true }, // 👈 Indexed for fast date queries
  endDate: { type: Date },
  time: { type: String, required: true },
  ticketPrice: { type: Number, required: true, min: 10 },
  totalSeats: { type: Number, required: true, default: 80 },
  bookedSeats: { type: [String], default: [] },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// 👈 Compound index to optimize querying shows by movie and date simultaneously
showSchema.index({ movie: 1, date: 1 });

module.exports = mongoose.model('shows', showSchema);