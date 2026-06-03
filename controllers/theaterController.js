const Theater = require('../models/theaterModel.js');
const addTheater = async (req, res, next) => {

    try {
        const theaters = req.body
        console.log(theaters);
        
        const newTheater = new Theater(theaters);
        await newTheater.save();
        res.status(201).send({

            success: true,
            message: "theater added successfully!!"
            ,data:newTheater    
        })
    }
    catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
}
// Get All Theaters
const getAllTheaters = async (req, res) => {
    try {
        const theaters = await Theater.find().sort({ createdAt: -1 });
       console.log( theaters)
        res.status(200).send({
            success: true,
            data: theaters
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

module.exports = { addTheater, getAllTheaters };