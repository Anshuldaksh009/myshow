const router = require('express').Router();
const { addTheater, getAllTheaters } = require('../controllers/theaterController');

router.post('/add', authMiddleware, adminMiddleware, addTheater);
router.get('/get-all', getAllTheaters);

module.exports = router;