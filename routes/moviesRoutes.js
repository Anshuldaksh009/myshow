const mongoose = require('mongoose');
const express=require('express')
const Movies = require('../models/movieModel.js')
const Shows = require('../models/showModel.js')
const Users = require('../models/userModel.js')
const validateId=require('../middlewares/validateId.js')
//addMovies,getMoviesById,getAllMovies

const router = require('express').Router();
const { addMovies, getAllMovies, getMovieById } = require('../controllers/moviesController');
router.post('/add', addMovies);
router.get('/get-all', getAllMovies);
router.get('/:id',validateId, getMovieById);


module.exports = router;
