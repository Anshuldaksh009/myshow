const mongoose = require('mongoose');

const testSchema = new mongoose.Schema({
  name: { type: String },
father: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('test', testSchema);