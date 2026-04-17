const mysql = require('mysql2/promise')
require('dotenv').config()

const db = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'tuloclicks',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

async function testConnection() {
  try {
    const connection = await db.getConnection()
    console.log(`✅ MySQL connected to database: ${process.env.DB_NAME || 'tuloclicks'}`)
    connection.release()
  } catch (error) {
    console.error('❌ Database connection failed:', error.message)
  }
}

testConnection()

module.exports = db