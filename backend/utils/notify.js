const db = require('../db')

async function createNotification({
  user_id,
  title,
  message,
  type = 'info',
  related_type = null,
  related_id = null
}) {
  try {
    if (!user_id || !title || !message) return

    await db.query(
      `
      INSERT INTO notifications
      (user_id, title, message, type, related_type, related_id)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [user_id, title, message, type, related_type, related_id]
    )
  } catch (error) {
    console.error('Notification create error:', error.message)
  }
}

module.exports = createNotification