const Show = require("../models/showModel");


const router = require('express').Router();
const showController = require('../controllers/showController');

router.get('/filter-shows', showController.getShowsByCityAndMovie);

module.exports = router;