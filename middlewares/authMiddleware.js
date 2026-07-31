const jwt = require('jsonwebtoken');
require('dotenv').config(); 

// This middleware checks the validity of the user (is he logged in or not)
module.exports = (req, res, next) => {
    try {
        // 1. Extract the token from the 'Authorization' header (handles both cases safely)
        const authHeader = req.headers.authorization || req.headers.Authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).send({
                success: false,
                message: "Access Denied. Please log in first."
            });
        }

        // Split "Bearer <token_string>" and take index 1
        const token = authHeader.split(' ')[1];

        // 2. Verify token using your environment variable
        const decryptedToken = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. 🎯 THE FIX: Attach data directly to 'req' (NOT req.body!)
        // This makes it work flawlessly for GET, POST, PUT, and DELETE requests.
        req.user = decryptedToken; 
        
        // Also attaching these directly to req just in case your older controllers still look for them
        req.userId = decryptedToken.userId || decryptedToken.id || decryptedToken._id;
        req.userRole = decryptedToken.role;

        // Move to the next controller
        next();

    } catch (error) {
        console.log("❌ JWT VERIFICATION ERROR DETAILS:", error.message);
        
        return res.status(401).send({
            success: false,
            message: "Session expired or invalid token. Please log in again."
        });
    }
};