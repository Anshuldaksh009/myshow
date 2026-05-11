const express = require("express");
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const listing = require('./models/testingModel.js')
const Movies = require("./models/movieModel.js")
const Shows = require('./models/showModel.js')
const Users = require('./models/userModel.js')
const bcrypt = require('bcryptjs');
//const MongoStore = require('connect-mongo'); //  CORRECT//for store session on cloud
//const passport = require('passport');

//const methodOverride = require('method-override');

app.use(express.json());


async function main() {
    //for local db connection await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
    //   await mongoose.connect(dbUrl)
    await mongoose.connect('mongodb://127.0.0.1:27017/myshow');

    console.log('MongoDB connected');
}
main().catch(err => console.log(err));
app.get('/', (req, res) => {
    res.redirect("/listing");
});


app.get("/listing", async (req, res) => { // Changed to POST for testing data
    console.log('Request received!');
    const { name, father } = req.body;
    console.log(`Name: ${name}, Father: ${father}`);
    const user = new listing(req.body);

    const savedUser = await user.save();


    await new listing(req.body).save();
    res.send({
        status: "Success",
    });
});

//------------------------------------------------------
//End points of basic APIs for movies search


app.get('/listing/movies/all', async (req, res) => {

    try {

        const movie = Movies.find();
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


})


app.post('/listing/movies/add', async (req, res) => {
    console.log('things are working');


})

app.get('/listing/movies/:id', async (req, res) => {

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

})
app.get('/listing/movies', async (req, res) => {
    try {
        // 1. Extract city and movie from query parameters
        const { movie, city } = req.query;

        // 2. Find shows matching the movie ID
        // We use .populate('theater') to get the city info from the theater document
        const shows = await Show.find({ movie })
            .populate("movie")
            .populate("theater");

        // 3. Logic to filter based on City
        // We check if the populated theater's city matches the requested city
        const filteredShows = shows.filter((show) => {
            // Use toLowerCase() to make the search case-insensitive
            return show.theater.city.toLowerCase() === city.toLowerCase();
        });

        res.status(200).send({
            success: true,
            message: "Shows fetched successfully",
            data: filteredShows,
        });
    }
    catch (err) {
        res.status(500).send({
            success: false,
            message: err.message,
        });

    }

})
//---------------------------------------------------------------
//Register and login  APIs
app.post('/listing/users/register', async (req, res) => {
    try {
        console.log(userDetail);
        
        const userExist = await Users.findOne({ email: userDetail.email })
        
        if (userExist) {
            return res.status(400).send({ success: false, message: "User already exists" });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userDetail.password, salt)
        userDetail.password = hashedPassword
        const newUser = new Users(userDetail);
        await newUser.save();
        res.status(201).send({ success: true, message: "Registration successful! Please login." });
    } catch (error) {
        res.status(500).send({ success: false, message: error.message });
    }

})

app.post('/listing/users')


//--------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});