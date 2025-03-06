const {rateLimit} = require("express-rate-limit");

const rateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 5, 
    message: {error:"Rate limit exceeded. Try again later."}
});

module.exports = rateLimiter;