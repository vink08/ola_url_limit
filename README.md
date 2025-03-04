# URL Shortener API

A RESTful API service that shortens URLs, tracks usage analytics, and implements rate limiting.

## Features

- **URL Shortening**: Convert long URLs to short, manageable links
- **Redirection**: Redirect from short URLs to the original destinations
- **Analytics**: Track how many times each shortened URL has been accessed
- **Rate Limiting**: Limit users to 5 URL shortenings per hour (IP-based)
- **URL Expiry**: Shortened URLs automatically expire after 7 days

## API Documentation

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables (copy `.env.example` to `.env`)
4. Start MongoDB (make sure it's installed and running)
5. Run the server:
   ```
   npm start
   ```
### Shorten URL
```
POST /shorten
https://ola-url-limit.onrender.com/shorten

```

**Request Body:**
```json
{
  "originalUrl": "https://example.com/"
}
```

**Response:**
```json
{
  "success": true,
  "shortUrl": "https://ola-url-limit.onrender.com/abc123",
  "shortCode": "abc123",
  "expiresAt": "2025-03-10T12:00:00.000Z"
}
```

### Redirect to Original URL
```
GET /:shortCode
https://ola-url-limit.onrender.com/:shortCode
```

This endpoint redirects the client to the original URL.

### Get URL Statistics
```
GET /stats/:shortCode
https://ola-url-limit.onrender.com/stats/:shortCode
```

**Response:**
```json
{
  "success": true,
  "shortCode": "abc123",
  "originalUrl": "https://example.com/",
  "clicks": 42,
  "createdAt": "2025-03-03T12:00:00.000Z",
  "expiresAt": "2025-03-10T12:00:00.000Z"
}
```

**If Exceed requests more than 5 in a hour**
```json
{
    "success": false,
    "message": "Rate limit exceeded. Only 6 URLs can be shortened per hour.",
    "resetAt": "2025-03-04T05:55:30.459Z"
}

```
```json
PORT=3000
MONGODB_URI=mongodb+srv://
BASE_URL=http://localhost:3000
SHORTCODE_LENGTH=6
RATE_LIMIT_WINDOW_MS=3600000
RATE_LIMIT_MAX=5
URL_EXPIRY_DAYS=7

```

## Installation and Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Configure environment variables (copy `.env.example` to `.env`)
4. Start MongoDB (make sure it's installed and running)
5. Run the server:
   ```
   npm start
   ```
