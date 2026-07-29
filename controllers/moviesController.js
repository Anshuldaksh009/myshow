const mongoose = require('mongoose');
const Movies = require("../models/movieModel.js");
const Shows = require('../models/showModel.js');
const getAllMovies = async (req, res) => {
  try {
    const { city } = req.query;
    console.log("➡️ [BACKEND] City requested:", city);

    if (!city) {
      const movies = await Movies.find();
      console.log("➡️ [BACKEND] Returning all movies count:", movies.length);
      return res.status(200).json({ success: true, data: movies });
    }

    const showsInCity = await Shows.find()
      .populate({
        path: 'theater',
        match: { city: new RegExp(`^${city}$`, 'i') }
      })
      .populate('movie');

    console.log("➡️ [BACKEND] Raw shows found in DB:", showsInCity.length);

    const validShows = showsInCity.filter((show) => show.theater !== null);
    console.log("➡️ [BACKEND] Shows matching city:", validShows.length);

    const movieMap = new Map();
    validShows.forEach((show) => {
      if (show.movie && show.movie._id) {
        movieMap.set(show.movie._id.toString(), show.movie);
      }
    });

    const cityMovies = Array.from(movieMap.values());
    console.log("➡️ [BACKEND] Unique movies returning to frontend:", cityMovies.length);

    return res.status(200).json({
      success: true,
      data: cityMovies
    });
  } catch (err) {
    console.error("❌ [BACKEND ERROR]:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};
// GET MOVIE BY ID
const getMovieById = async (req, res, next) => {
  console.log("request get in backened in getmoviebyid");
  
  try {
    const id = req.params.id;
    const movie = await Movies.findById(id);
console.log("getMovieByid  2nd check point");

    if (!movie) {
      console.log("error check point");
      
      return res.status(404).json({ success: false, message: "Movie not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Movie fetched successfully",
      data: movie // 👈 Added missing movie data payload
    });
  } catch (err) {
    console.log("finall error checkpoint");
    
    console.error("Error in getMovieById:", err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ADD NEW MOVIE
const addMovies = async (req, res, next) => {
  try {
    const addNewMovie = req.body;
    const newMovie = new Movies(addNewMovie);
    await newMovie.save();

    return res.status(201).json({ 
      success: true, 
      message: "Movie added successfully!" 
    });
  } catch (err) {
    return res.status(500).json({ 
      success: false, 
      message: err.message || "Failed to add movie" 
    });
  }
};

module.exports = { addMovies, getMovieById, getAllMovies };