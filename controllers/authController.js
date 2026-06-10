const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- REGISTER CONTROLLER ---
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

        res.status(200).send({
            success: true,
            message: "Login successful! pass the token successfully",
            data: token // The frontend will save this token
        });

    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};