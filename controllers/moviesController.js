const mongoose = require('mongoose');
const express=require('express')
const Movies = require("../models/movieModel.js")
const Shows = require('../models/showModel.js')
const Users = require('../models/userModel.js')
const router=express.Router();


 const getAllMovies=async (req,res,next) => {
      try {

        const movie = await Movies.find();
        console.log('i m awokrig', movie);
                         
        res.send({
            success: true,
            message: "movies feteched success fully",

        });

    }
    catch (err) {
        console.log('not working');

        res.status(500).send({ success: false, message: err.message });
    }

 

}
const getMovieById=async (req, res,next) => {

    try {
        const id = req.params.id;
        const movie = await Movies.findById(id)
        if (!movie) {
            return res.status(404).send({ success: false, message: "Movie not found" });
        }

        console.log('its working ');

        res.status(200).send({
            success: true,
            message: "Shows fetched successfully",

        });
    }


    catch (err) {
        console.log("this is you error", err);

    }

}

const addMovies=async (req,res,next) => {
    console.log("i m here add movie");
    
    try{
        const addNewMovie=req.body
        console.log("here is  your movie ", addNewMovie);
        
        const newMovie=new Movies(addNewMovie);
        await newMovie.save();
        res.status(201).send({ success: true, message: "Movie added!" });
    }catch (err) {
        res.status(500).send({ success: false, message: "not working" });
    }
}


module.exports={addMovies,getMovieById,getAllMovies}
// app.get('/listing/movies/all', async (req, res) => {

//     try {

//         const movie = Movies.find();
//         console.log('i m awokrig', movie);

//         res.send({
//             success: true,
//             message: "movies feteched success fully",

//         });

//     }
//     catch (err) {
//         console.log('not working');

//         res.status(500).send({ success: false, message: err.message });
//     }


// })


// app.post('/listing/movies/add', async (req, res) => {
//     console.log('things are working');


// })

// app.get('/listing/movies/:id', async (req, res) => {

//     try {
//         const id = req.params.id;
//         const movie = await Movies.findById(id)
//         if (!movie) {
//             return res.status(404).send({ success: false, message: "Movie not found" });
//         }

//         console.log('its working ');

//         res.status(200).send({
//             success: true,
//             message: "Shows fetched successfully",

//         });
//     }


//     catch (err) {
//         console.log("this is you error", err);

//     }

// // })
// app.get('/listing/movies', async (req, res) => {
//     try {
//         // 1. Extract city and movie from query parameters
//         const { movie, city } = req.query;

//         // 2. Find shows matching the movie ID
//         // We use .populate('theater') to get the city info from the theater document
//         const shows = await Show.find({ movie })
//             .populate("movie")
//             .populate("theater");

//         // 3. Logic to filter based on City
//         // We check if the populated theater's city matches the requested city
//         const filteredShows = shows.filter((show) => {
//             // Use toLowerCase() to make the search case-insensitive
//             return show.theater.city.toLowerCase() === city.toLowerCase();
//         });

//         res.status(200).send({
//             success: true,
//             message: "Shows fetched successfully",
//             data: filteredShows,
//         });
//     }
//     catch (err) {
//         res.status(500).send({
//             success: false,
//             message: err.message,
//         });

//     }

// })
