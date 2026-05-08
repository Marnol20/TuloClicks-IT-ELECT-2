import { useEffect, useState } from 'react'
import { RefreshCw } from 'lucide-react'
import '../../styles/Attendees.css'
import '../../styles/AdminPages.css'
import api from '../../services/api'

function ActivityLogs() {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => { fetchLogs() }, [])

  async function fetchLogs() {
    try {
      setLoading(true)
      const res = await api.get('/activity-logs/admin/all')
      setLogs(res.data || [])
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }

  function formatDate(date) {
    if (!date) return 'N/A'
    return new Date(date).toLocaleString('en-PH')
  }

  const todayCount = logs.filter((l) => {
    const d = new Date(l.created_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  }).length

  return (
    <main className="admin-page">
      <div className="admin-hero">
        <div className="admin-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="admin-hero-overlay" style={{ background: 'linear-gradient(160deg,rgba(59,130,246,0.4) 0%,rgba(6,10,22,0.5) 60%),linear-gradient(0deg,rgba(6,10,22,0.92) 0%,transparent 60%)' }} />
        <div>
          <h2>Activity Logs</h2>
          <p>Monitor real-time actions and security audits across the platform.</p>
        </div>
        <div className="admin-hero-stats">
          <div className="admin-hero-stat blue">
            <span className="admin-hero-stat-val">{logs.length}</span>
            <span className="admin-hero-stat-label">Total Logs</span>
          </div>
          <div className="admin-hero-stat purple">
            <span className="admin-hero-stat-val">{todayCount}</span>
            <span className="admin-hero-stat-label">Today</span>
          </div>
          <div>
            <button className="admin-refresh-btn" onClick={fetchLogs}>
              <RefreshCw size={14} /> Refresh
            </button>
          </div>
        </div>
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
          <div className="table-empty">Loading logs…</div>
        ) : logs.length === 0 ? (
          <div className="table-empty">No activity recorded yet.</div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="table-row" style={{ gridTemplateColumns: '1fr 1.2fr 1fr 2fr 1fr 1.4fr' }}>
              <span className="row-name">{log.user_name || 'System'}</span>
              <span className="table-badge info">{log.action}</span>
              <span className="row-muted">
                {log.entity_type ? `${log.entity_type} #${log.entity_id || ''}` : 'N/A'}
              </span>
              <span className="row-muted">{log.description}</span>
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
