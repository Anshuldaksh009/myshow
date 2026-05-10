const mongoose = require('mongoose');

const showSchema = new mongoose.Schema({
  name: { type: String, required: true }, // e.g., "Morning Show"
  date: { type: Date, required: true },
  time: { type: String, required: true },
  movie: { type: mongoose.Schema.Types.ObjectId, ref: 'movies', required: true },
  theater: { type: mongoose.Schema.Types.ObjectId, ref: 'theaters', required: true },
  ticketPrice: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  bookedSeats: { type: Array, default: [] } // Stores strings like ["A1", "A2"]
}, { timestamps: true });

module.exports = mongoose.model('shows', showSchema);