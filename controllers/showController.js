const Show = require("../models/showModel.js");
const Theater = require("../models/theaterModel.js");

// 1. ADD SHOW (Saves endDate & isActive)
const addShow = async (req, res) => {
  try {
    const { movie, theater, date, endDate, time, ticketPrice, name, totalSeats } = req.body;

    if (!ticketPrice || Number(ticketPrice) < 10) {
      return res.status(400).send({
        success: false,
        message: 'Ticket price must be at least ₹10.'
      });
    }

    let seatsCount = totalSeats;
    if (!seatsCount) {
      const theaterDoc = await Theater.findById(theater);
      seatsCount = theaterDoc?.totalSeats || 80;
    }

    const newShow = new Show({
      name: name || 'Screening Slot',
      movie,
      theater,
      date,
      endDate: endDate || date, // Fallback to date if not provided
      time,
      ticketPrice: Number(ticketPrice),
      totalSeats: seatsCount,
      bookedSeats: [],
      isActive: true
    });

    await newShow.save();

    return res.status(201).send({
      success: true,
      message: 'Showtime scheduled successfully!',
      data: newShow
    });
  } catch (error) {
    console.error('Error adding show:', error);
    return res.status(500).send({
      success: false,
      message: error.message || 'Server error while creating show.'
    });
  }
};

// 2. GET SHOWS BY CITY & MOVIE (Corruption-Proof Query)
const getShowsByCityAndMovie = async (req, res) => {
  try {
    const { movie, city, date } = req.query;

    if (!movie || !city) {
      return res.status(400).send({
        success: false,
        message: 'Movie ID and City are required.',
      });
    }

    // 🛡️ Safe isActive filter: $ne: false includes true AND undefined/missing fields (old records)
    let filter = { movie: movie, isActive: { $ne: false } };

    // Date filtering logic
    if (date && date !== 'undefined' && date !== 'null') {
      const targetDate = new Date(date);
      if (!isNaN(targetDate.getTime())) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        // Matches shows where requested date falls in range, or falls on 'date' for older records
        filter.$or = [
          { date: { $gte: startOfDay, $lte: endOfDay } },
          { endDate: { $gte: startOfDay }, date: { $lte: endOfDay } }
        ];
      }
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.date = { $gte: today };
    }

    const shows = await Show.find(filter)
      .populate('movie')
      .populate('theater');

    // Safe City Filter
    const filteredShows = shows.filter((show) => {
      if (!show.theater || !show.theater.city) return false;
      return show.theater.city.trim().toLowerCase() === city.trim().toLowerCase();
    });

    return res.status(200).send({
      success: true,
      data: filteredShows,
    });
  } catch (error) {
    console.error('Error in getShowsByCityAndMovie:', error);
    return res.status(500).send({
      success: false,
      message: error.message || 'Server error while fetching shows by city and movie.'
    });
  }
};

// 3. GET ALL SHOWS FOR ADMIN
const getAllShows = async (req, res) => {
  try {
    const shows = await Show.find({ isActive: { $ne: false } })
      .populate('movie')
      .populate('theater')
      .sort({ createdAt: -1 });

    return res.status(200).send({
      success: true,
      data: shows
    });
  } catch (error) {
    console.error('Error in getAllShows:', error);
    return res.status(500).send({ success: false, message: error.message });
  }
};

// 4. SOFT / HARD DELETE SHOW
const deleteShow = async (req, res) => {
  try {
    // Check both showId and id to handle any route parameter naming
    const id = req.params.showId || req.params.id;

    console.log("🗑️ Attempting to delete show with ID:", id);

    if (!id) {
      return res.status(400).send({
        success: false,
        message: 'Show ID parameter is missing in request URL.'
      });
    }

    const show = await Show.findById(id);
    if (!show) {
      return res.status(404).send({
        success: false,
        message: 'Show not found.'
      });
    }

    await Show.findByIdAndDelete(id);

    return res.status(200).send({
      success: true,
      message: 'Showtime deleted successfully.'
    });

  } catch (error) {
    console.error('Error in deleteShow:', error);
    return res.status(500).send({
      success: false,
      message: error.message || 'Server error while deleting show.'
    });
  }
};
// 5. GET SHOW BY ID
const getShowById = async (req, res) => {
  try {
    const reqId = req.params.id;
    if (!reqId) {
      return res.status(400).send({ success: false, message: "Show ID is required" });
    }

    const show = await Show.findById(reqId)
      .populate("movie")
      .populate("theater");

    if (!show) {
      return res.status(404).send({ success: false, message: "Show not found" });
    }

    return res.status(200).send({ success: true, data: show });
  } catch (err) {
    console.error("Error in getShowById:", err);
    return res.status(500).send({ success: false, message: err.message });
  }
};

module.exports = {
  deleteShow,
  addShow,
  getAllShows,
  getShowById,
  getShowsByCityAndMovie
};