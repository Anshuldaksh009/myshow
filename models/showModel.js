const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  name: { type: String, required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'movies', required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'theaters', required: true },
  date: { type: Date, required: true },         // Start date / Show date
  endDate: { type: Date },                      // Optional: Soft end date for show run
  time: { type: String, required: true },
  ticketPrice: { type: Number, required: true, min: 10 },
  totalSeats: { type: Number, required: true, default: 80 },
  bookedSeats: { type: [String], default: [] },
  isActive: { type: Boolean, default: true }    // Soft delete / active status
}, { timestamps: true });

module.exports = mongoose.model('shows', showSchema);