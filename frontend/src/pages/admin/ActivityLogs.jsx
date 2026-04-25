import { useEffect, useState } from 'react'
import '../../styles/Attendees.css'
import api from '../../services/api'

function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLogs()
  }, [])

  async function fetchLogs() {
    try {
      setLoading(true)
      const res = await api.get('/activity-logs/admin/all')
      setLogs(res.data || [])
    } catch (error) {
      console.error('Fetch activity logs error:', error)
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-PH') // Philippine time format
  }

  return (
    <main className="attendees-page">
      <div className="attendees-top">
        <div className="attendees-title">
          <div>
            <h2>System Activity Logs</h2>
            <p>Monitor real-time actions and security audits across the platform</p>
          </div>
        </div>
        <button className="reports-refresh-btn" onClick={fetchLogs} style={{ padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
          Refresh Logs
        </button>
      </div>

      <div className="attendees-table">
        <div className="table-header" style={{ gridTemplateColumns: '1fr 1.2fr 1fr 2fr 1fr 1.4fr' }}>
          <span>User</span>
          <span>Action</span>
          <span>Entity</span>
          <span>Description</span>
          <span>IP Address</span>
          <span>Timestamp</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading logs...</div>
        ) : logs.length === 0 ? (
          <div className="table-empty">No activity recorded yet.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="table-row" style={{ gridTemplateColumns: '1fr 1.2fr 1fr 2fr 1fr 1.4fr' }}>
              <span className="row-name">{log.user_name || 'System'}</span>
              <span className="table-badge info" style={{ fontSize: '11px' }}>{log.action}</span>
              <span className="row-muted">
                {log.entity_type ? `${log.entity_type} #${log.entity_id || ''}` : 'N/A'}
              </span>
              <span className="row-muted" style={{ fontSize: '13px' }}>{log.description}</span>
              <span className="row-muted">{log.ip_address || '0.0.0.0'}</span>
              <span className="row-muted">{formatDate(log.created_at)}</span>
            </div>
          ))
        )}
      </div>
    </main>
  )
}

export default ActivityLogs