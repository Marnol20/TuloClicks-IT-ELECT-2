const mysql = require('mysql2/promise')
require('dotenv').config()

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tuloclicks',
  port: Number(process.env.DB_PORT) || 3306,
})

async function testBooking() {
  try {
    console.log('Testing booking creation...')
    
    // Test the exact same query as in the booking route
    const event_id = 1
    const attendee_name = 'Test User'
    const attendee_email = 'test@example.com'
    const attendee_phone = '1234567890'
    const ticket_type_id = 1
    const quantity = 1
    const unit_price = 5500
    const subtotal = 5500
    
    // Start transaction
    const connection = await db.getConnection()
    await connection.beginTransaction()
    
    console.log('1. Checking event...')
    const [events] = await connection.query(
      `
      SELECT *
      FROM events
      WHERE id = ?
        AND approval_status = 'approved'
        AND publish_status = 'published'
      LIMIT 1
      `,
      [Number(event_id)]
    )
    
    if (events.length === 0) {
      await connection.rollback()
      console.log('Event not found')
      return
    }
    
    console.log('2. Checking ticket...')
    const [ticketRows] = await connection.query(
      `
      SELECT *
      FROM ticket_types
      WHERE event_id = ?
        AND id = ?
        AND is_active = 1
      `,
      [Number(event_id), Number(ticket_type_id)]
    )
    
    if (ticketRows.length === 0) {
      await connection.rollback()
      console.log('Ticket not found')
      return
    }
    
    const ticket = ticketRows[0]
    console.log('Ticket found:', ticket)
    
    const bookingReference = 'TC-2026-123456'
    
    console.log('3. Creating booking...')
    const [bookingResult] = await connection.query(
      `
      INSERT INTO bookings
      (
        booking_reference,
        user_id,
        event_id,
        booking_status,
        payment_status,
        attendee_name,
        attendee_email,
        attendee_phone,
        total_amount
      )
      VALUES (?, ?, ?, 'pending', 'unpaid', ?, ?, ?, ?)
      `,
      [
        bookingReference,
        2, // user_id
        Number(event_id),
        attendee_name.trim(),
        attendee_email.trim().toLowerCase(),
        attendee_phone || null,
        subtotal
      ]
    )
    
    const bookingId = bookingResult.insertId
    console.log('Booking created:', bookingId)
    
    console.log('4. Creating booking item...')
    const [itemResult] = await connection.query(
      `
      INSERT INTO booking_items
      (
        booking_id,
        ticket_type_id,
        quantity,
        unit_price,
        subtotal
      )
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        bookingId,
        ticket_type_id,
        quantity,
        unit_price,
        subtotal
      ]
    )
    
    console.log('Booking item created:', itemResult)
    
    await connection.commit()
    console.log('Transaction committed successfully')
    
  } catch (error) {
    console.error('Error:', error.message)
    console.error('SQL State:', error.sqlState)
    console.error('SQL Message:', error.sqlMessage)
  } finally {
    await db.end()
  }
}

testBooking()