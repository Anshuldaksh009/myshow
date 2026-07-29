const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const Movies = require('./models/movieModel.js');
const Theater = require('./models/theaterModel.js');
const Shows = require('./models/showModel.js');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/bookmyshow';

const freshMovies = [
  {
    title: 'The Last Horizon',
    description: 'A team of astronauts embarks on a perilous deep-space expedition beyond the solar system.',
    duration: 145,
    genre: 'Sci-Fi',
    language: 'English',
    posterUrl: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=600&q=80',
    releaseDate: new Date()
  },
  {
    title: '3 Idiots',
    description: 'Three engineering students navigate friendship, pressure, and finding their real passions.',
    duration: 170,
    genre: 'Comedy/Drama',
    language: 'Hindi',
    posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=600&q=80',
    releaseDate: new Date()
  },
  {
    title: 'Midnight Terror',
    description: 'A family moves into a haunted mansion with a chilling backstory in the woods.',
    duration: 115,
    genre: 'Horror',
    language: 'English',
    posterUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=600&q=80',
    releaseDate: new Date()
  },
  {
    title: 'Avatar: The Way of Water',
    description: 'Jake Sully lives with his newfound family formed on the extrasolar moon Pandora.',
    duration: 192,
    genre: 'Sci-Fi/Action',
    language: 'English',
    posterUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
    releaseDate: new Date()
  }
];

const freshTheaters = [
  { name: 'PVR: Panipat TFC', city: 'Panipat', address: 'TFC Mall, Sector 13-17', phone: 9876543210, totalSeats: 80 },
  { name: 'Cinepolis Fun City', city: 'Panipat', address: 'GT Road, Panipat', phone: 9876543211, totalSeats: 80 },
  { name: 'DB City Cinepolis', city: 'Bhopal', address: 'Arera Hills, Bhopal', phone: 9876543212, totalSeats: 100 },
  { name: 'PVR Select CITYWALK', city: 'Delhi-NCR', address: 'Saket, New Delhi', phone: 9876543213, totalSeats: 120 }
];

const seedMore = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB...');

    const insertedMovies = await Movies.insertMany(freshMovies);
    const insertedTheaters = await Theater.insertMany(freshTheaters);

    const dummyShows = [];
    const times = ['10:00 AM', '02:30 PM', '07:00 PM', '10:15 PM'];

    insertedTheaters.forEach((theater) => {
      insertedMovies.forEach((movie, mIdx) => {
        dummyShows.push({
          name: `${movie.title} - Show ${mIdx + 1}`,
          movie: movie._id,
          theater: theater._id,
          date: new Date(),
          time: times[mIdx % times.length],
          ticketPrice: 250,
          totalSeats: theater.totalSeats || 80,
          bookedSeats: ['A3', 'A4', 'C5'] // Pre-book 3 seats to demonstrate greyed-out seat UI
        });
      });
    });

    await Shows.insertMany(dummyShows);
    console.log('🎉 Seeded fresh movies, theaters, and showtimes with working image URLs!');
    process.exit(0);
  } catch (err) {
    console.error('Seeder Error:', err);
    process.exit(1);
  }
};

seedMore();