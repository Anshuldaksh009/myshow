const router = require('express').Router();
const authController = require('../controllers/authController');
const validateUser=require('../middlewares/validateUser');
// Route for new users
router.post('/register',validateUser, authController.register);

// Route for existing users signing back in
router.post('/login',validateUser, authController.login);

module.exports = router;