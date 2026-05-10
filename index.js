const express = require("express");
const app = express();
const PORT = 3000;
const mongoose = require('mongoose');
const listing = require('./models/testingModel.js')
//const MongoStore = require('connect-mongo'); //  CORRECT//for store session on cloud
//const passport = require('passport');
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
app.get('/listing/movies', (req, res) => {
    const { name, father } = req.body
    console.log("hey i am ", name, " its working ");

    console.log("this version also working ");
    res.send({
        status: "siccess"

    })

})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});