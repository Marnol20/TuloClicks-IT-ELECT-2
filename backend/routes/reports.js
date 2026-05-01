const express = require('express');
const db = require('../db');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

const router = express.Router();

/**
 * ADMIN: Get detailed reports with date range filtering
 */
router.get('/admin/summary', authMiddleware, roleMiddleware('admin'), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Default: last 30 days
    const end = endDate ? new Date(endDate) : new Date();
    const start = startDate ? new Date(startDate) : new Date(end.getTime() - 30*24*60*60*1000);

    const dateFilter = `AND DATE(b.booked_at) BETWEEN ? AND ?`;
    const dateParams = [
      start.toISOString().split('T')[0],
      end.toISOString().split('T')[0]
    ];

    // 1. REVENUE METRICS
    const [revenueData] = await db.query(`
      SELECT 
        SUM(b.total_amount) as total_revenue,
        COUNT(DISTINCT b.id) as total_bookings,
        AVG(b.total_amount) as avg_booking_value
      FROM bookings b
      WHERE b.payment_status = 'paid' ${dateFilter}
    `, dateParams);

    // 2. REVENUE TREND (Monthly)
    const [revenueTrend] = await db.query(`
      SELECT 
        DATE_FORMAT(b.booked_at, '%Y-%m') as month,
        SUM(b.total_amount) as revenue,
        COUNT(b.id) as bookings
      FROM bookings b
      WHERE b.payment_status = 'paid' ${dateFilter}
      GROUP BY DATE_FORMAT(b.booked_at, '%Y-%m')
      ORDER BY month ASC
    `, dateParams);

    // 3. USER METRICS
    const [userMetrics] = await db.query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN role = 'user' THEN 1 ELSE 0 END) as regular_users,
        SUM(CASE WHEN role = 'organizer' THEN 1 ELSE 0 END) as organizers,
        SUM(CASE WHEN DATE(created_at) BETWEEN ? AND ? THEN 1 ELSE 0 END) as new_users
      FROM users
    `, dateParams);

    // 4. EVENT METRICS
    const [eventMetrics] = await db.query(`
      SELECT 
        COUNT(*) as total_events,
        SUM(CASE WHEN approval_status = 'approved' THEN 1 ELSE 0 END) as approved_events,
        SUM(CASE WHEN approval_status = 'pending' THEN 1 ELSE 0 END) as pending_events,
        SUM(CASE WHEN approval_status = 'rejected' THEN 1 ELSE 0 END) as rejected_events,
        SUM(CASE WHEN publish_status = 'cancelled' THEN 1 ELSE 0 END) as cancelled_events
      FROM events
    `);

    // 5. BOOKING STATUS
    const [bookingStatus] = await db.query(`
      SELECT 
        booking_status,
        COUNT(*) as count
      FROM bookings
      WHERE DATE(booked_at) BETWEEN ? AND ?
      GROUP BY booking_status
    `, dateParams);

    // 6. PAYMENT STATUS
    const [paymentStatus] = await db.query(`
      SELECT 
        payment_status,
        COUNT(*) as count,
        SUM(total_amount) as total
      FROM bookings
      WHERE DATE(booked_at) BETWEEN ? AND ?
      GROUP BY payment_status
    `, dateParams);

    // 7. CATEGORY PERFORMANCE
    const [categoryPerformance] = await db.query(`
      SELECT 
        c.id,
        c.name as category_name,
        COUNT(DISTINCT e.id) as event_count,
        COUNT(DISTINCT b.id) as booking_count,
        SUM(b.total_amount) as total_revenue
      FROM event_categories c
      LEFT JOIN events e ON c.id = e.category_id
      LEFT JOIN bookings b ON e.id = b.event_id AND DATE(b.booked_at) BETWEEN ? AND ?
      GROUP BY c.id, c.name
      ORDER BY total_revenue DESC
      LIMIT 10
    `, dateParams);

    // 8. TOP EVENTS
    const [topEvents] = await db.query(`
      SELECT 
        e.id,
        e.title,
        COUNT(b.id) as booking_count,
        SUM(b.total_amount) as booking_revenue,
        e.start_date
      FROM events e
      LEFT JOIN bookings b ON e.id = b.event_id AND DATE(b.booked_at) BETWEEN ? AND ?
      WHERE e.approval_status = 'approved'
      GROUP BY e.id
      ORDER BY booking_revenue DESC
      LIMIT 10
    `, dateParams);

    // 9. TOP ORGANIZERS
    const [topOrganizers] = await db.query(`
      SELECT 
        u.id,
        u.name,
        COUNT(DISTINCT e.id) as event_count,
        COUNT(DISTINCT b.id) as booking_count,
        SUM(b.total_amount) as total_revenue
      FROM users u
      LEFT JOIN events e ON u.id = e.organizer_id
      LEFT JOIN bookings b ON e.id = b.event_id AND DATE(b.booked_at) BETWEEN ? AND ?
      WHERE u.role = 'organizer'
      GROUP BY u.id
      ORDER BY total_revenue DESC
      LIMIT 10
    `, dateParams);

    // 10. VENUE UTILIZATION
    const [venueUtilization] = await db.query(`
      SELECT 
        v.id,
        v.name,
        COUNT(DISTINCT e.id) as event_count,
        COUNT(DISTINCT b.id) as booking_count,
        SUM(b.total_amount) as revenue
      FROM venues v
      LEFT JOIN events e ON v.id = e.venue_id
      LEFT JOIN bookings b ON e.id = b.event_id AND DATE(b.booked_at) BETWEEN ? AND ?
      GROUP BY v.id
      ORDER BY booking_count DESC
      LIMIT 10
    `, dateParams);

    // 11. CONVERSION METRICS
    const [conversionMetrics] = await db.query(`
      SELECT 
        COUNT(DISTINCT b.user_id) as total_bookers,
        COUNT(DISTINCT u.id) as total_users,
        ROUND((COUNT(DISTINCT b.user_id) / COUNT(DISTINCT u.id) * 100), 2) as conversion_rate,
        ROUND(SUM(CASE WHEN b.booking_status = 'cancelled' THEN 1 ELSE 0 END) / COUNT(b.id) * 100, 2) as cancellation_rate,
        ROUND(SUM(CASE WHEN p.payment_status = 'failed' THEN 1 ELSE 0 END) / COUNT(b.id) * 100, 2) as failed_payment_rate
      FROM bookings b
      LEFT JOIN payments p ON b.id = p.booking_id
      LEFT JOIN users u ON 1=1
      WHERE DATE(b.booked_at) BETWEEN ? AND ?
    `, dateParams);

    // 12. SUPPORT METRICS
    const [supportMetrics] = await db.query(`
      SELECT 
        COUNT(*) as total_tickets,
        SUM(CASE WHEN status = 'open' THEN 1 ELSE 0 END) as open_tickets,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved_tickets,
        SUM(CASE WHEN status = 'closed' THEN 1 ELSE 0 END) as closed_tickets
      FROM support_tickets
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, dateParams);

    // 13. PLATFORM METRICS
    const [platformMetrics] = await db.query(`
      SELECT 
        SUM(amount) as total_revenue,
        COUNT(*) as total_transactions
      FROM payments
      WHERE DATE(created_at) BETWEEN ? AND ?
    `, dateParams);

    return res.json({
      dateRange: { start: start.toISOString().split('T')[0], end: end.toISOString().split('T')[0] },
      revenue: revenueData[0],
      revenueTrend,
      users: userMetrics[0],
      events: eventMetrics[0],
      bookingStatus,
      paymentStatus,
      categoryPerformance,
      topEvents,
      topOrganizers,
      venueUtilization,
      conversion: conversionMetrics[0],
      support: supportMetrics[0],
      platform: platformMetrics[0]
    });
  } catch (error) {
    console.error('Get reports error:', error);
    return res.status(500).json({ error: 'Server error fetching reports.' });
  }
});

module.exports = router;