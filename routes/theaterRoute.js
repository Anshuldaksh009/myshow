const router = require('express').Router();
const { addTheater, getAllTheaters } = require('../controllers/theaterController');

router.post('/add', addTheater);
router.get('/get-all', getAllTheaters);

module.exports = router;