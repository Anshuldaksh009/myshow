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
    res.redirect("/listing/movies");
});



app.use((req, res, next) => {
    console.log(`Incoming Request: ${req.method} ${req.url}`);
    next();
});
app.use(morgan('dev'));

// Base path for all authentication requests
app.use('/listing/users', userRoutes);
app.use('/listing/shows',showRoutes)
app.use('/listing/theaters', theaterRoute);
app.use('/listing/movies', movieRoutes);
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