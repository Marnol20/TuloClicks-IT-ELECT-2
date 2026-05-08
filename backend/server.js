const express = require('express');
const cors = require('cors');
const path = require('path'); 
require('dotenv').config();

const db = require('./db');
const setupDb = require('./setup-db');

const app = express();

// Initialise database schema on startup (no-op if tables already exist)
setupDb();

// 1. CORS CONFIGURATION
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tuloclicks.vercel.app'
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] // Gidugangan para sa token
}));

// 2. MIDDLEWARE
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
  res.send('TuloClicks Backend is running');
});

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok');
    res.json({
      message: 'Database connected successfully',
      result: rows
    });
  } catch (error) {
    console.error('DB test error:', error);
    res.status(500).json({
      error: error.message
    });
  }
});

// 3. ROUTES - Imports
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const organizerRoutes = require('./routes/organizers');
const categoryRoutes = require('./routes/categories');
const venueRoutes = require('./routes/venues');
const eventRoutes = require('./routes/events');
const speakerRoutes = require('./routes/speakers');
const ticketRoutes = require('./routes/tickets');
const bookingRoutes = require('./routes/bookings');
const paymentRoutes = require('./routes/payments');
const notificationRoutes = require('./routes/notifications');
const reportsRoutes = require('./routes/reports');
const activityLogsRoutes = require('./routes/activityLogs');
const supportRoutes = require('./routes/support'); 
const reviewRoutes = require('./routes/reviews'); 

// Route Registration
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/venues', venueRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/speakers', speakerRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/activity-logs', activityLogsRoutes);
app.use('/api/support', supportRoutes); 
app.use('/api/reviews', reviewRoutes);

// 4. ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    error: 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});