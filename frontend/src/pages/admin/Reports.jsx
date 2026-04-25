import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts'
import '../../styles/Reports.css'
import api from '../../services/api'

function Reports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      setLoading(true)
      const res = await api.get('/reports/admin/summary')
      setData(res.data || {})
    } catch (error) {
      console.error('Fetch reports error:', error)
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="reports-empty">Analyzing system data...</div>
  if (!data) return <div className="reports-empty">Failed to load system reports.</div>

  // Data mapping para sa mga charts
  const bookingChartData = [
    { name: 'Confirmed', total: Number(data.bookings?.confirmed_bookings || 0) },
    { name: 'Cancelled', total: Number(data.bookings?.cancelled_bookings || 0) },
    { name: 'Checked In', total: Number(data.bookings?.checked_in_bookings || 0) }
  ]

  const paymentPieData = (data.payment_status_breakdown || []).map(p => ({ 
    name: p.payment_status, 
    value: Number(p.total) 
  }))

  const topEventsChartData = (data.top_events || []).map(e => ({
    name: e.title?.length > 15 ? `${e.title.slice(0, 15)}...` : e.title,
    bookings: Number(e.booking_count || 0),
    revenue: Number(e.booking_revenue || 0)
  }))

  const pieColors = ['#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#38bdf8']

  return (
    <main className="reports-page">
      <div className="reports-header">
        <div>
          <h2>System Reports & Analytics</h2>
          <p>Database insights and platform performance</p>
        </div>
        <div className="reports-actions">
          <button className="reports-refresh-btn" onClick={fetchReports}>Refresh Data</button>
        </div>
      </div>

      {/* 1. Summary Cards */}
      <section className="reports-cards">
        <div className="report-card">
          <p className="report-card-label">Total Revenue</p>
          <h3 className="report-card-value">₱{Number(data.payments?.total_revenue || 0).toLocaleString()}</h3>
        </div>
        <div className="report-card">
          <p className="report-card-label">Total Users</p>
          <h3 className="report-card-value">{data.users?.total_users || 0}</h3>
        </div>
        <div className="report-card">
          <p className="report-card-label">Approved Events</p>
          <h3 className="report-card-value">{data.events?.approved_events || 0}</h3>
        </div>
      </section>

      {/* 2. Primary Charts Grid */}
      <section className="reports-grid">
        <div className="reports-panel chart-panel">
          <h3>Booking Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={bookingChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#111827', border: 'none', borderRadius: '8px' }} />
              <Bar dataKey="total" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="reports-panel chart-panel">
          <h3>Payment Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={paymentPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {paymentPieData.map((_, i) => <Cell key={i} fill={pieColors[i % pieColors.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 3. Top Events Comparison Chart */}
      <section className="reports-grid" style={{ marginTop: '20px' }}>
        <div className="reports-panel chart-panel full-span">
          <h3>Top Events: Bookings vs Revenue</h3>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={topEventsChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#111827', border: 'none' }} />
              <Legend />
              <Bar dataKey="bookings" fill="#22c55e" radius={[6, 6, 0, 0]} />
              <Bar dataKey="revenue" fill="#38bdf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* 4. Support & Tables */}
      <section className="reports-grid">
        <div className="reports-panel">
          <h3>Support Overview</h3>
          <div className="reports-list">
            <div className="reports-row"><span>Open Tickets</span><strong>{data.support?.open_support || 0}</strong></div>
            <div className="reports-row"><span>Resolved</span><strong>{data.support?.resolved_support || 0}</strong></div>
          </div>
        </div>

        <div className="reports-panel">
          <h3>Leaderboard Table</h3>
          <div className="reports-table">
            {(data.top_events || []).map(e => (
              <div key={e.id} className="reports-table-row">
                <span>{e.title}</span>
                <span style={{ color: '#22c55e' }}>₱{Number(e.booking_revenue).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default Reports