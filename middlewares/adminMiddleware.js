module.exports = (req, res, next) => {
    try {
        console.log("User:", req.user);
        console.log("User Role:", req.userRole);

        if (req.userRole !== 'admin') {
            return res.status(403).send({
                success: false,
                message: "Access Denied. Only system Administrators can perform this action."
            });
        }

        next();

    } catch (error) {
        res.status(500).send({
            success: false,
            message: error.message + " problem in admin middleware"
        });
    }
};