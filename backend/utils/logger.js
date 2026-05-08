const db = require('../db')

async function logActivity({
  user_id = null,
  action = '',
  entity_type = 'system',
  entity_id = null,
  description = '',
  req = null
}) {
  try {
    await db.query(
      `
      INSERT INTO activity_logs
      (user_id, action, entity_type, entity_id, description, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        user_id,
        action,
        entity_type || 'system',
        entity_id,
        description,
        req?.ip || null
      ]
    )
  } catch (error) {
    console.error('Logging error:', error.message)
  }
}

module.exports = logActivity