const mongoose = require('mongoose');

const urlSchema = new mongoose.Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  shortCode: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 60 * 60 * 24 * process.env.URL_EXPIRY_DAYS, // ttl index to out after 7 days expiry
  },
  clicks: {
    type: Number,
    default: 0,
  },
  ipAddress: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Url', urlSchema);