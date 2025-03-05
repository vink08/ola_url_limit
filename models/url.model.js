
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
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: function () {
      return new Date(Date.now() + 1000 * 60 * 60 * 24 * process.env.URL_EXPIRY_DAYS);
    },
    index: { expires: 0 } // TTL Index for automatic deletion
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

// Ensure index is created for TTL
urlSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Url', urlSchema);
