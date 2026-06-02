const Show = require("../models/showModel.js");

const Theater =require('../models/theaterModel.js')
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