const mongoose = require('mongoose');

module.exports = (req, res, next) => {
    // Check params, query, or body for an 'id'
    const id = req.params.id || req.query.id || req.body.id;

    if (id && !mongoose.Types.ObjectId.isValid(id)) {

        console.log('problem in  validateId middleware');
        
        return res.status(400).send({
            success: false,
            message: "Invalid ID format  where provided."
        });
    }
    next(); // Move to the controller
};