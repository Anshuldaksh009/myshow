const Show = require("../models/showModel.js");

const Theater =require('../models/theaterModel.js')




// CREATE A SHOW
const addShow = async (req, res) => {
    try {
        const newShow = new Show(req.body);
        await newShow.save();
        res.status(201).send({
            success: true,
            message: "Show added successfully!"
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

// GET ALL SHOWS (With Populated Data)
const getAllShows = async (req, res) => {
    try {
        const shows = await Show.find()
            .populate('movie')    // Replaces Movie ID with Movie Details
            .populate('theater')  // Replaces Theater ID with Theater Details
            .sort({ createdAt: -1 });

        res.status(200).send({
            success: true,
            data: shows
        });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }
};

module.exports = { addShow, getAllShows };


exports.getShowsByCityAndMovie = async (req, res) => {
    try {
        const { movie, city } = req.query;
        const shows = await Show.find({ movie })
            .populate("movie")
            .populate("theater");

        const filteredShows = shows.filter((show) => {
            return show.theater.city.toLowerCase() === city.toLowerCase();
        });

        res.status(200).send({
            success: true,
            data: filteredShows,
        });
    } catch (err) {
        res.status(500).send({ success: false, message: err.message });
    }
};