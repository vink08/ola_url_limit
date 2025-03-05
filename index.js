
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const urlRoutes = require('./routes/url.routes');
const { connectRedis } = require('./config/redis');

const app = express();
const PORT = process.env.PORT || 10000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/', urlRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Internal Server Error' 
  });
});

const setupServer = async () => {
  try {
    await connectRedis(); // Ensure Redis is connected
    await mongoose.connect(process.env.MONGODB_URI);
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Startup error:', error);
    process.exit(1);
  }
};

setupServer();