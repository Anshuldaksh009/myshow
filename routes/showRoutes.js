const Show = require("../models/showModel");


const router = require('express').Router();
const showController = require('../controllers/showController');
const validateId=require('../middlewares/validateId.js')

//for check the token 
const authMiddleware=require('../middlewares/authMiddleware.js')
const  adminMiddleware=require('../middlewares/adminMiddleware.js')
console.log('i am getting requests');

const { addShow, deleteShow, getAllShows, getShowById, getShowsByCityAndMovie } = require('../controllers/showController');

router.post('/add-show', authMiddleware, adminMiddleware, addShow);
router.delete('/delete-show/:id',  authMiddleware, adminMiddleware,deleteShow);
router.get('/get-all-shows', getAllShows);

// 👈 Route for movie/city show filtering
router.get('/get-shows-by-city-and-movie', getShowsByCityAndMovie);
router.get('/get-all-shows-by-movie/:movieId', getShowsByCityAndMovie); // Supports both route styles!

router.get('/get-show-by-id/:id', getShowById);

module.exports = router;