const express = require('express')
const cors = require('cors')
const path = require('path') 
require('dotenv').config()

const db = require('./db')

const app = express()

// 1. CORS CONFIGURATION - Gi-update para sa Authorization Headers
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tuloclicks.vercel.app'
  ],
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization'] // Gidugangan ni para sa token[cite: 7]
}))

// 2. MIDDLEWARE
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
  res.send('TuloClicks Backend is running')
})

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok')
    res.json({
      message: 'Database connected successfully',
      result: rows
    })
  } catch (error) {
    console.error('DB test error:', error)
    res.status(500).json({
      error: error.message
    })
  }
})

// 3. ROUTES - Imports[cite: 7]
const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')
const organizerRoutes = require('./routes/organizers')
const categoryRoutes = require('./routes/categories')
const venueRoutes = require('./routes/venues')
const eventRoutes = require('./routes/events')
const speakerRoutes = require('./routes/speakers')
const ticketRoutes = require('./routes/tickets')
const bookingRoutes = require('./routes/bookings')
const paymentRoutes = require('./routes/payments')
const notificationRoutes = require('./routes/notifications')
const reportsRoutes = require('./routes/reports')
const activityLogsRoutes = require('./routes/activityLogs')
const supportRoutes = require('./routes/support'); 
const reviewRoutes = require('./routes/reviews'); 


// Route Registration[cite: 7]
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/organizers', organizerRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/speakers', speakerRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/activity-logs', activityLogsRoutes)
app.use('/api/support', supportRoutes); 
app.use('/api/reviews', reviewRoutes);

// 4. ERROR HANDLING[cite: 7]
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({
    error: 'Internal server error'
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})const express = require('express')
const cors = require('cors')
const path = require('path') 
require('dotenv').config()

const db = require('./db')

const app = express()

// 1. CORS CONFIGURATION
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://tuloclicks.vercel.app'
  ],
  credentials: true
}))

// 2. MIDDLEWARE - Important: must be before routes
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (req, res) => {
  res.send('TuloClicks Backend is running')
})

app.get('/test-db', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT 1 AS ok')
    res.json({
      message: 'Database connected successfully',
      result: rows
    })
  } catch (error) {
    console.error('DB test error:', error)
    res.status(500).json({
      error: error.message
    })
  }
})

// 3. ROUTES
const authRoutes = require('./routes/auth')
const usersRoutes = require('./routes/users')
const organizerRoutes = require('./routes/organizers')
const categoryRoutes = require('./routes/categories')
const venueRoutes = require('./routes/venues')
const eventRoutes = require('./routes/events')
const speakerRoutes = require('./routes/speakers')
const ticketRoutes = require('./routes/tickets')
const bookingRoutes = require('./routes/bookings')
const paymentRoutes = require('./routes/payments')
const notificationRoutes = require('./routes/notifications')
const reportsRoutes = require('./routes/reports')
const activityLogsRoutes = require('./routes/activityLogs')


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', authRoutes)
app.use('/api/users', usersRoutes)
app.use('/api/organizers', organizerRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/venues', venueRoutes)
app.use('/api/events', eventRoutes)
app.use('/api/speakers', speakerRoutes)
app.use('/api/tickets', ticketRoutes)
app.use('/api/bookings', bookingRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/reports', reportsRoutes)
app.use('/api/activity-logs', activityLogsRoutes)

// 4. ERROR HANDLING
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err)
  res.status(500).json({
    error: 'Internal server error'
  })
})

const PORT = process.env.PORT || 5000

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})