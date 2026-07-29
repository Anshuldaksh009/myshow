const express = require('express');
const router = express.Router();

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware.js');
const adminMiddleware = require('../middlewares/adminMiddleware.js');
const validateId = require('../middlewares/validateId.js');

// Controller Functions (ensure file name matches: moviesController.js)
const { addMovies, getAllMovies, getMovieById } = require('../controllers/moviesController.js');

// 🎬 MOVIE ROUTES

// 1. Get all movies (Supports optional ?city=CityName query filtering)
// Public route - anyone can view available movies
router.get('/get-all', getAllMovies);

// 2. Get single movie details by ID
// Public route with ID validation middleware
router.get('/:id', validateId, getMovieById);

// 3. Add new movie
// Protected route - requires both user authentication & admin authorization
router.post('/add', authMiddleware, adminMiddleware, addMovies);

module.exports = router;