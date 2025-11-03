const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(express.json()); // Allows us to read JSON in request bodies

// --- Routes ---
// A simple "health check" route to see if the server is running
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

app.use('/api/admin', require('./routes/admin.routes.js'));

// --- Start the Server ---
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  // Start cron jobs
  const cronService = require('./services/cron.service');
  cronService.startAll();
});
// in server.js
// OLD: app.use('/api/menu', require('./routes/menu.routes.js'));
// NEW:
app.use('/api/admin', require('./routes/admin.routes.js'));