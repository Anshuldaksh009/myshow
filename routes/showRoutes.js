const Show = require("../models/showModel");


const router = require('express').Router();
const showController = require('../controllers/showController');
const validateId=require('../middlewares/validateId.js')

//for check the token 
const authMiddleware=require('../middlewares/authMiddleware.js')
const  adminMiddleware=require('../middlewares/adminMiddleware.js')
console.log('i am getting requests');

router.post('/add-show', authMiddleware, adminMiddleware, showController.addShow);
router.delete('/delete-show/:id',validateId,adminMiddleware,showController.deleteShow)

router.get('/filter-shows', showController.getShowsByCityAndMovie);

router.get('/get-show-by-id/:id',validateId, showController.getShowById);

router.get('/get-all-shows-by-movie',showController.getShowsByCityAndMovie)


module.exports = router;