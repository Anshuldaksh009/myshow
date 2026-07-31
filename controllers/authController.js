const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config(); // 👈 Make sure dotenv is required so process.env variables load
// --- REGISTER CONTROLLER ---
// At the top of your authController.js, add these imports:
const OTP = require('../models/otpModel');
const nodemailer = require('nodemailer');
//const bcrypt = require('bcryptjs'); // ensure bcrypt is imported

// Configure Nodemailer Transporter using your .env credentials
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },connectionTimeout: 10000, // Fail after 10 seconds instead of hanging
  socketTimeout: 10000,
});

// ==========================================
// YOUR EXISTING CONTROLLER FUNCTIONS 
// (register, login, etc.) STAY HERE UNCHANGED
// ==========================================

exports.sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).send({ success: false, message: 'Email is required.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).send({ success: false, message: 'Email is already registered. Please log in.' });
    }

    const generatedOtp = Math.floor(100000 + Math.random() * 900000).toString();

    const salt = await bcrypt.genSalt(10);
    const hashedOtp = await bcrypt.hash(generatedOtp, salt);

    await OTP.deleteMany({ email: email.toLowerCase() });

    await OTP.create({
      email: email.toLowerCase(),
      otp: hashedOtp,
    });

   // Inside sendOtp in authController.js:
const mailOptions = {
  from: `"myshow" <${process.env.EMAIL_USER}>`, // 👈 MUST match EMAIL_USER
  to: email, // 👈 The recipient address entered in the form
  subject: '🔑 Your Verification Code for BookMyShow',
  html: `
    <div style="font-family: Arial, sans-serif; padding: 20px;">
      <h2>BookMyShow Email Verification</h2>
      <p>Your OTP verification code is:</p>
      <h1 style="color: #dc3545; letter-spacing: 4px;">${generatedOtp}</h1>
      <p>This code will expire in 5 minutes.</p>
    </div>
  `,
};

    // Send email
    await transporter.sendMail(mailOptions);

    return res.status(200).send({
      success: true,
      message: `OTP sent successfully to ${email}`,
    });
  } catch (error) {
    // 🔍 THIS CONSOLE LOG WILL SHOW THE EXACT ERR IN YOUR BACKEND TERMINAL
    console.error('❌ NODEMAILER ERROR DETAILS:', error);

    return res.status(500).send({
      success: false,
      message: error.message || 'Failed to send OTP email.',
    });
  }
};
// 🆕 2. REGISTER WITH OTP CONTROLLER
exports.registerWithOtp = async (req, res) => {
  try {
    const { name, email, password, otp, role } = req.body;

    if (!name || !email || !password || !otp) {
      return res.status(400).send({ success: false, message: 'All fields including OTP are required.' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ email: email.toLowerCase() });
    if (!otpRecord) {
      return res.status(400).send({
        success: false,
        message: 'OTP has expired or was not requested. Click "Send OTP" again.',
      });
    }

    // Verify OTP match
    const isOtpValid = await bcrypt.compare(otp, otpRecord.otp);
    if (!isOtpValid) {
      return res.status(400).send({ success: false, message: 'Invalid OTP entered. Please try again.' });
    }

    // Hash user password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save user to MongoDB
    const newUser = new User({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: role || 'user',
    });

    await newUser.save();

    // Clear used OTP record
    await OTP.deleteOne({ _id: otpRecord._id });

    return res.status(201).send({
      success: true,
      message: '🎉 Account created successfully! You can now log in.',
    });
  } catch (error) {
    console.error('Error in registerWithOtp:', error);
    return res.status(500).send({
      success: false,
      message: error.message || 'Server error during registration.',
    });
  }
};

exports.register = async (req, res) => {
    try {
        const { name, email, password ,role} = req.body;

        console.log(req.body);
        
        // 1. THE CRITICAL CHECK: Does this email already exist?
        const userExists = await User.findOne({ email });
        
        if (userExists) {
            // If the user is already in the database, we stop here!
            return res.status(400).send({ 
                success: false, 
                message: "This email is already registered. Please sign in instead." 
            });
        }

        // 2. If it's a new user, hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 3. Create the user with the hidden password
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();

        res.status(201).send({ 
            success: true, 
            message: "User registered successfully! You can now log in." 
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// --- LOGIN CONTROLLER ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).send({ success: false, message: "User not found. Please register first." });
        }

        // 2. Check if the password is correct
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send({ success: false, message: "Invalid email or password." });
        }

        // 3. Generate JWT Token (Their digital ID card)
        const token = jwt.sign(
            { userId: user._id, role: user.role },
           process.env.JWT_SECRET, // Keep this safe in your .env file later
            { expiresIn: '1d' } // Token expires in 1 day
        );
console.log( "authController working");
return res.status(200).send({
      success: true,
      message: 'Login successful',
      data: token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};