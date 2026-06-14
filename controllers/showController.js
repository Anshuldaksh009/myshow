const Show = require("../models/showModel.js");

const Theater =require('../models/theaterModel.js')




// CREATE A SHOW
const addShow = async (req, res) => {
    console.log('add show working');
    
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
// 2. DELETE A SHOW (Admin)
const deleteShow = async (req, res) => {
    try {
        await Show.findByIdAndDelete(req.params.id);
        res.send({
            success: true,
            message: "Show deleted successfully!"
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




const getShowsByCityAndMovie = async (req, res) => {
  console.log('here things also workng ');
  
  
    try {
        const { movie, city } = req.query;
        console.log(movie ,city);
        // 1. Validation: If city is missing, stop here and tell the user
        if (!movie || !city) {
            return res.status(400).send({
                success: false,
                message: "Please provide both movie ID and city name in the URL"
            });
        }
        
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
const getShowById = async (req, res) => {
    try {
        const reqId= req.params.id
         if (!reqID) {
            return res.status(400).send({
                success: false,
                message: "there is something wrong in the requested URL"
            });
        }
        const show = await Show.findById(reqId)
            .populate("movie")
            .populate("theater");
            
        res.status(200).send({
            success: true,
            data: show
        });
    } catch (err) {
        res.status(500).send({ success: false, message: err.message });
    }
};
module.exports = { deleteShow,addShow, getAllShows ,getShowById,getShowsByCityAndMovie};