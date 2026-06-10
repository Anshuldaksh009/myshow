const mongoose = require('mongoose');
const express=require('express')
const Movies = require('../models/movieModel.js')
const Shows = require('../models/showModel.js')
const Users = require('../models/userModel.js')
const validateId=require('../middlewares/validateId.js')
//addMovies,getMoviesById,getAllMovies

const  adminMiddleware=require('../middlewares/adminMiddleware.js')
const router = require('express').Router();
const { addMovies, getAllMovies, getMovieById } = require('../controllers/moviesController');
const authMiddleware = require('../middlewares/authMiddleware.js');
router.post('/add',authMiddleware,adminMiddleware, addMovies);
router.get('/get-all', getAllMovies);
router.get('/:id',validateId, getMovieById);


module.exports = router;
