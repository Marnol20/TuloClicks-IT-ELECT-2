const mysql = require('mysql2/promise')
require('dotenv').config()

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tuloclicks',
  port: Number(process.env.DB_PORT) || 3306,
})

async function testBookingItems() {
  try {
    console.log('Testing booking_items table...')
    
    // Check if booking_items table exists
    const [tables] = await db.query('SHOW TABLES LIKE "booking_items"')
    console.log('Tables found:', tables)
    
    if (tables.length > 0) {
      // Describe the table structure
      const [columns] = await db.query('DESCRIBE booking_items')
      console.log('booking_items columns:', columns)
      
      // Test a simple insert
      console.log('Testing insert...')
      const [result] = await db.query(
        'INSERT INTO booking_items (booking_id, ticket_type_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)',
        [1, 1, 1, 100, 100]
      )
      console.log('Insert result:', result)
    } else {
      console.log('booking_items table does not exist')
    }
    
  } catch (error) {
    console.error('Error:', error.message)
    console.error('SQL State:', error.sqlState)
    console.error('SQL Message:', error.sqlMessage)
  } finally {
    await db.end()
  }
}

testBookingItems()