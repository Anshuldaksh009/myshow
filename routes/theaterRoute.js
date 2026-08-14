const router = require('express').Router();
const { addTheater, getAllTheaters } = require('../controllers/theaterController');

//for check the token 
const authMiddleware=require('../middlewares/authMiddleware.js')
const  adminMiddleware=require('../middlewares/adminMiddleware.js')
router.post('/add', authMiddleware, adminMiddleware, addTheater);
router.get('/get-all', getAllTheaters);

module.exports = router;