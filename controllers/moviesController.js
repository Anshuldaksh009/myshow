const mongoose = require('mongoose');
const express=require('express')
const Movies = require("../models/movieModel.js")
const Shows = require('../models/showModel.js')
const Users = require('../models/userModel.js')
const router=express.Router();


 
const addMovies = async (req, res, next) => {
    try {
        // 1. Destructure all the required keys from your movieSchema
        const { title, description, duration, genre, language, releaseDate, posterUrl } = req.body;

        // 2. Explicit field validation check to prevent empty or incomplete data packets
        if (!title || !description || !duration || !genre || !language || !releaseDate || !posterUrl) {
            return res.status(400).json({ 
                success: false, 
                message: "Validation failed. Please provide all required fields: title, description, duration, genre, language, releaseDate, and posterUrl." 
            });
        }

        // 3. Create a clean instance using the exact validated schema properties
        const newMovie = new Movies({
            title,
            description,
            duration,     // Stored as a Number (representing minutes)
            genre,
            language,
            releaseDate,  // Expects a valid Date string format (e.g., "YYYY-MM-DD")
            posterUrl
        });

        // 4. Save the document to your MongoDB collection
        await newMovie.save();

        // 5. Return an industry-standard 201 Created status code with the saved data
        res.status(201).json({ 
            success: true, 
            message: "Movie added successfully!", 
            data: newMovie 
        });

    } catch (err) {
        // Fallback catch-all for database connection failures or internal schema violations
        res.status(500).json({ 
            success: false, 
            message: "Server Error: Unable to add movie.", 
            error: err.message 
        });
    }
};

// @desc    Get all movies (Crucial for rendering your UI landing page cards!)
// @route   GET /listing/movies
// @access  Public
const getAllMovies = async (req, res, next) => {
    try {
        // Fetches all records and sorts them by newest creation date first
        const allMovies = await Movies.find().sort({ createdAt: -1 }); 
        
        res.status(200).json({
            success: true,
            count: allMovies.length,
            movies: allMovies
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: "Server Error: Unable to fetch movies.",
            error: err.message
        });
    }
};
// @desc    Get a single movie by its MongoDB ID
// @route   GET /listing/movies/:id
// @access  Public
const getMovieById = async (req, res, next) => {
    try {
        // 1. Extract the movie ID from the request parameters (URL path)
        const { id } = req.params;

        // 2. Query MongoDB using Mongoose's built-in findById method
        const movie = await Movies.findById(id);

        // 3. If the movie doesn't exist, return a 404 Not Found error response
        if (!movie) {
            return res.status(404).json({
                success: false,
                message: `Movie not found with an ID of: ${id}`
            });
        }

        // 4. Return a 200 OK response with the single movie object data packet
        res.status(200).json({
            success: true,
            movie
        });

    } catch (err) {
        // Handle CastError separately (occurs when an invalid MongoDB ObjectId string format is sent)
        if (err.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: "Invalid ID format. Please provide a valid 24-character hexadecimal MongoDB ObjectId."
            });
        }

        // General fallback for internal server connection bugs
        res.status(500).json({
            success: false,
            message: "Server Error: Unable to fetch movie details.",
            error: err.message
        });
    }
};
module.exports = {
    addMovies,
    getAllMovies,
    getMovieById
};