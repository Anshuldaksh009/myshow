const router = require('express').Router();
const authController = require('../controllers/authController');
const validateUser=require('../middlewares/validateUser');
// Route for new users
router.post('/register',validateUser, authController.register);

// Route for existing users signing back in
router.post('/login',validateUser, authController.login);
router.post('/send-otp', authController.sendOtp);
router.post('/register-with-otp', authController.registerWithOtp);
module.exports = router;