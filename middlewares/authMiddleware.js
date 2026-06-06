const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        // 1. Extract the token from the 'Authorization' header
        const authHeader = req.headers.authorization;
        
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
        
        // 3. Attach the userId to req.body so the controller knows who is calling it
        req.body.userId = decryptedToken.userId;
        req.body.userRole = decryptedToken.role;

        // Move to the controller
        next();

    } catch (error) {
        return res.status(401).send({
            success: false,
            message: "Session expired or invalid token. Please log in again."
        });
    }
};