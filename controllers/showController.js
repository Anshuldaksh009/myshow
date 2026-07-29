
const Show = require("../models/showModel.js");

const Theater =require('../models/theaterModel.js')




// CREATE A SHOW
const addShow = async (req, res) => {
    try {
    const { movie, theater, date, time, ticketPrice, name, totalSeats } = req.body;

    // 1. Ticket Price Validation
    if (!ticketPrice || Number(ticketPrice) < 10) {
      return res.status(400).send({
        success: false,
        message: 'Ticket price must be at least ₹10.'
      });
    }

    // 2. Show Date Validation
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    if (selectedDate < sixMonthsAgo) {
      return res.status(400).send({
        success: false,
        message: 'Cannot schedule shows for dates older than 6 months.'
      });
    }

    if (selectedDate < today) {
      return res.status(400).send({
        success: false,
        message: 'Cannot schedule shows for past dates.'
      });
    }

    // 3. Fallback for totalSeats from Theater if not explicitly sent
    let seatsCount = totalSeats;
    if (!seatsCount) {
      const theaterDoc = await Theater.findById(theater);
      seatsCount = theaterDoc?.totalSeats || 80;
    }

    // 4. Create Show
    const newShow = new Show({
      name: name || 'Screening Slot',
      movie,
      theater,
      date,
      time,
      ticketPrice: Number(ticketPrice),
      totalSeats: seatsCount,
      bookedSeats: []
    });

    await newShow.save();

    res.status(201).send({
      success: true,
      message: 'Showtime scheduled successfully!',
      data: newShow
    });

  } catch (error) {
    console.error('Error adding show:', error);
    res.status(500).send({
      success: false,
      message: error.message || 'Server error while creating show.'
    });
  }
};

// 2. DELETE A SHOW (Admin)exports.
const deleteShow = async (req, res) => {
  try {
    const { showId } = req.params;

    const show = await Show.findById(showId);
    if (!show) {
      return res.status(404).send({ success: false, message: 'Show not found.' });
    }

    // Optional: Warn or prevent deletion if tickets are already booked
    if (show.bookedSeats && show.bookedSeats.length > 0) {
      return res.status(400).send({
        success: false,
        message: `Cannot delete show. ${show.bookedSeats.length} seats are already booked!`
      });
    }

    await Show.findByIdAndDelete(showId);

    res.status(200).send({
      success: true,
      message: 'Showtime deleted successfully.'
    });
  } catch (error) {
    res.status(500).send({ success: false, message: error.message });
  }
};
// GET ALL SHOWS (With Populated Data)
const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find()
            .populate('movie')    // Replaces Movie ID with Movie Details
            .populate('theater')  // Replaces Theater ID with Theater Details
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            data: shows
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};



const getShowsByCityAndMovie = async (req, res) => {
  console.log("getShowsByCityAndMovie called");

  try {
    const { movie, city, date } = req.query;
    console.log("Query Params -> Movie:", movie, "| City:", city, "| Date:", date);

    if (!movie || !city) {
      return res.status(400).send({
        success: false,
        message: 'Movie ID and City are required.',
      });
    }

    // Base query: match movie ID
    let filter = { movie: movie };

    // Safely handle date filtering
    if (date && date !== 'undefined' && date !== 'null') {
      const startOfDay = new Date(date);
      if (!isNaN(startOfDay.getTime())) {
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        filter.date = {
          $gte: startOfDay,
          $lte: endOfDay,
        };
      }
    } else {
      // Default: show today's and future shows
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      filter.date = { $gte: today };
    }

    // Populate theater & movie details
    const shows = await Show.find(filter)
      .populate('movie')
      .populate('theater');

    // 🛡️ SAFE FILTER: Prevent crash if show.theater is null or undefined
    const filteredShows = shows.filter((show) => {
      if (!show.theater || !show.theater.city) return false;
      return show.theater.city.trim().toLowerCase() === city.trim().toLowerCase();
    });

    return res.status(200).send({
      success: true,
      data: filteredShows,
    });
  } catch (error) {
    console.error('Error fetching shows by city and date:', error);
    return res.status(500).send({
      success: false,
      message: error.message || 'Server error while fetching shows',
    });
  }
};
const getShowById = async (req, res) => {
    try {
        const reqId = req.params.id;

        if (!reqId) { // Fixed typo (reqID -> reqId)
            return res.status(400).send({
                success: false,
                message: "Show ID is required"
            });
        }

        const show = await Show.findById(reqId)
            .populate("movie")
            .populate("theater");

        if (!show) {
            return res.status(404).send({
                success: false,
                message: "Show not found"
            });
        }
            
        return res.status(200).send({
            success: true,
            data: show
        });
    } catch (err) {
        console.error("Error in getShowById:", err);
        return res.status(500).send({ success: false, message: err.message });
    }
};
module.exports = { deleteShow,addShow, getAllShows ,getShowById,getShowsByCityAndMovie};