
// this middleware to check the user is admin or client

module.exports = (req, res, next) => {
    try {
        console.log(req.body);
        
        // req.body.userRole was safely attached by your authMiddleware earlier!
        if (req.body.userRole !== 'admin') {
            return res.status(403).send({
                success: false,
                message: "Access Denied. Only system Administrators can perform this action."
            });
        }

        // If they are an admin, let them pass to the controller
        next();

    } catch (error) {
        res.status(500).send({ success: false, message: error.message +"problem in admin middleware" });
    }
};