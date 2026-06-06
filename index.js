if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require("express");
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const listing = require('./models/testingModel.js')
const Movies = require("./models/movieModel.js")
const Shows = require('./models/showModel.js')
const Users = require('./models/userModel.js')
const Theater =require('./models/theaterModel.js')
const theaterRoute = require('./routes/theaterRoute');
const bcrypt = require('bcryptjs');
const { notFound, errorHandler } = require('./middlewares/errorMiddleware');
//const { addTheater, getAllTheaters } = require('../controllers/theaterController');
const movieRoutes=require('./routes/moviesRoutes.js')
const showRoutes=require('./routes/showRoutes.js')
const userRoutes = require('./routes/userRoutes');

//const MongoStore = require('connect-mongo'); //  CORRECT//for store session on cloud
//const passport = require('passport');
const dbUrl='mongodb://127.0.0.1:27017/myshow'
//const methodOverride = require('method-override');
const morgan = require('morgan');

app.use(express.json());


async function main() {
    //for local db connection await mongoose.connect('mongodb://127.0.0.1:27017/airbnb');
    //   await mongoose.connect(dbUrl)
    await mongoose.connect(dbUrl);

    console.log('MongoDB connected');
}
main().catch(err => console.log(err));
app.get('/', (req, res) => {
    res.redirect("/listing/movies/get-all");
});



app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method}http://localhost:3000 ${req.url}`);
    next();
});
app.use(morgan('dev'));

// Base path for all authentication requests
app.use('/listing/users', userRoutes);
app.use('/listing/shows',showRoutes)
app.use('/listing/theaters', theaterRoute);
app.use('/listing/movies', movieRoutes);
// app.get("/listing", async (req, res) => { // Changed to POST for testing data
//     console.log('Request received!');
//     const { name, father } = req.body;
//     console.log(`Name: ${name}, Father: ${father}`);
//     const user = new listing(req.body);

//     const savedUser = await user.save();


//     await new listing(req.body).save();
//     res.send({
//         status: "Success",
//     });
// });

//------------------------------------------------------
//End points of basic APIs for movies search

///listing/movies/all

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

//})
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
//shows route \
app.get('/listing/shows/all', async (req, res) => {
    try {
        const { movie } = req.query; // Get Movie ID from URL params

        const shows = await Shows.find({ movie })
            .populate('theater') // This replaces the Theater ID with the actual Theater Object
            .populate('movie');   // This replaces the Movie ID with the actual Movie Object

        res.send({
            success: true,
            data: shows
        });
    } catch (err) {
        res.status(500).send({ success: false, message: err.message });
    }
});
//------------------------------------------------
// //Theater route 
// app.post('/listing/theaters/add', async (req, res) => {
//     try {

//         const newItem=req.body
//         console.log(newItem);
        
//         const newTheater = new Theater(newItem);
//         await newTheater.save();
//         res.status(201).send({
//             success: true,
//             message: "Theater added successfully!",
//         });
//     } catch (err) {
//         res.status(500).send({ success: false, message: err.message });
//     }
// });
// app.get('/listing/theaters/get-all', async (req, res) => {
//     try {
//         const theaters = await Theater.find();
//         res.send({
//             success: true,
//             data: theaters
//         });
//     } catch (err) {
//         res.status(500).send({ success: false, message: err.message });
//     }
// });
// app.get('/listing/theaters/')
//--------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});



// 3. 404 Handler (if no route matched above)
app.use(notFound);

// 4. Global Error Handler (to catch server crashes)
app.use(errorHandler);

// At the bottom of server.js, after all other routes
app.get('/listing', (req, res) => {
    res.status(200).send({
        success: true,
        message: "Welcome to the BookMyShow API",
        version: "1.0.0",
        status: "Running"
    });
});