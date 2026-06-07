require('dotenv').config();
const express = require("express");
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// 1. Models 
const listing = require('./models/testingModel.js');
const Movies = require("./models/movieModel.js");
const Shows = require('./models/showModel.js');
const Users = require('./models/userModel.js');
const Theater = require('./models/theaterModel.js');

// 2. Routes (Sub-Routers)
const theaterRoute = require('./routes/theaterRoute');
const movieRoutes = require('./routes/moviesRoutes.js');
const showRoutes = require('./routes/showRoutes.js');
const userRoutes = require('./routes/userRoutes');

// 3. Middlewares
const { notFound, errorHandler } = require("./middlewares/errorMiddleware"); 

const app = express();
const PORT = 3000;

// Body Parser Middleware
app.use(express.json());

// Route A: Redirect root to listing
app.get('/', (req, res) => {
    res.redirect('/listing');
});

// Route B: The target listing route
app.get('/listing', (req, res) => {
    res.status(200).json({
        success: true,
        message: "API is running successfully"
    });
});

// 4. Mount Your Router Handlers
app.use('/listing/users', userRoutes);
app.use('/listing/shows', showRoutes);
app.use('/listing/theaters', theaterRoute);
app.use('/listing/movies', movieRoutes);


// 5. Global Catch-All Fallbacks (MUST BE AT THE VERY BOTTOM)
app.use(notFound); 
app.use(errorHandler);


// 6. DB Connection & Server Startup
async function startServer() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("MongoDB connected");

        app.listen(PORT, () => {
            console.log(`Server running at http://localhost:${PORT}`);
        });
    } catch (err) {
        console.log("DB connection failed:", err.message);
    }
}

startServer();