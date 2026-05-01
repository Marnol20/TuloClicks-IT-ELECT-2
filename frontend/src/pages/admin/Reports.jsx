import { useEffect, useState } from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Download, Calendar } from 'lucide-react'
import '../../styles/Reports.css'
import api from '../../services/api'
import { useToast } from '../../components/common/ToastContext'

function Reports() {
  const { addToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  function getDefaultStartDate() {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  }

  useEffect(() => {
    fetchReports()
  }, [])

  async function fetchReports() {
    try {
      setLoading(true)
      const res = await api.get('/reports/admin/summary', {
        params: { startDate, endDate }
      })
      setData(res.data)
    } catch (error) {
      console.error('Fetch reports error:', error)
      addToast('Failed to load reports', 'error')
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  function handleDateFilter() {
    fetchReports()
  }

  function exportToPDF() {
    addToast('PDF export coming soon', 'info')
  }

  function exportToCSV() {
    addToast('CSV export coming soon', 'info')
  }

  if (loading) return <div className="reports-empty">Analyzing system data...</div>
  if (!data) return <div className="reports-empty">Failed to load system reports.</div>

  const pieColors = ['#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#38bdf8', '#ec4899']

  return (
    <main className="reports-page">
      <div className="reports-header">
        <div>
          <h2>System Reports & Analytics</h2>
          <p>Comprehensive platform analytics and performance metrics</p>
        </div>
        <div className="reports-actions">
          <button onClick={exportToPDF} className="reports-btn">
            <Download size={16} /> PDF
          </button>
          <button onClick={exportToCSV} className="reports-btn">
            <Download size={16} /> CSV
          </button>
        </div>
      </div>

      {/* DATE RANGE FILTER */}
      <section className="reports-filter">
        <div className="filter-group">
          <label><Calendar size={16} /> Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="filter-group">
          <label><Calendar size={16} /> End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <button onClick={handleDateFilter} className="reports-filter-btn">Apply Filter</button>
      </section>

      {/* SUMMARY CARDS */}
      <section className="reports-cards">
        <div className="report-card">
          <p className="report-card-label">Total Revenue</p>
          <h3 className="report-card-value">₱{Number(data.revenue?.total_revenue || 0).toLocaleString()}</h3>
          <span className="report-card-meta">Avg: ₱{Number(data.revenue?.avg_booking_value || 0).toLocaleString()}</span>
        </div>
        <div className="report-card">
          <p className="report-card-label">Total Bookings</p>
          <h3 className="report-card-value">{data.revenue?.total_bookings || 0}</h3>
          <span className="report-card-meta">Avg: ₱{Number(data.revenue?.avg_booking_value || 0).toLocaleString()}</span>
        </div>
        <div className="report-card">
          <p className="report-card-label">Total Users</p>
          <h3 className="report-card-value">{data.users?.total_users || 0}</h3>
          <span className="report-card-meta">New: {data.users?.new_users || 0}</span>
        </div>
        <div className="report-card">
          <p className="report-card-label">Approved Events</p>
          <h3 className="report-card-value">{data.events?.approved_events || 0}</h3>
          <span className="report-card-meta">Pending: {data.events?.pending_events || 0}</span>
        </div>
      </section>

      {/* REVENUE TREND CHART */}
      <section className="reports-grid">
        <div className="reports-panel chart-panel full-span">
          <h3>Revenue Trend (Monthly)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueTrend || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#111827', border: 'none' }} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" name="Revenue" />
              <Line type="monotone" dataKey="bookings" stroke="#38bdf8" name="Bookings" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* EVENT STATUS & CATEGORY PERFORMANCE */}
      <section className="reports-grid">
        <div className="reports-panel chart-panel">
          <h3>Event Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            {(() => {
            const eventStatusData = [
              { name: 'Approved', value: Number(data.events?.approved_events || 0) },
              { name: 'Pending', value: Number(data.events?.pending_events || 0) },
              { name: 'Rejected', value: Number(data.events?.rejected_events || 0) },
              { name: 'Cancelled', value: Number(data.events?.cancelled_events || 0) }
            ].filter(item => item.value > 0);

              const hasData = eventStatusData.some(item => item.value > 0);
              
              if (!hasData) return <div className="no-data">No event data available for this period.</div>;

              return (
                <PieChart>
                  <Pie 
                    data={eventStatusData} 
                    nameKey="name" 
                    dataKey="value" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80} 
                    label
                  >
                    {eventStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              );
            })()}
          </ResponsiveContainer>
        </div>

        <div className="reports-panel chart-panel">
          <h3>Payment Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.paymentStatus || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
              <XAxis dataKey="payment_status" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#111827' }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* CATEGORY PERFORMANCE */}
      <section className="reports-grid">
        <div className="reports-panel chart-panel full-span">
          <h3>Top Categories by Revenue</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.categoryPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" stroke="#273244" />
              <XAxis dataKey="category_name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ background: '#111827' }} />
              <Legend />
              <Bar dataKey="event_count" fill="#22c55e" name="Events" />
              <Bar dataKey="booking_count" fill="#38bdf8" name="Bookings" />
              <Bar dataKey="total_revenue" fill="#f59e0b" name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* TOP EVENTS & CONVERSION METRICS */}
      <section className="reports-grid">
        <div className="reports-panel">
          <h3>Top Events</h3>
          <div className="reports-table">
            {(data.topEvents || []).map((e) => (
              <div key={e.id} className="reports-table-row">
                <div>
                  <span className="event-title">{e.title.substring(0, 25)}...</span>
                  <span className="event-date">{new Date(e.start_date).toLocaleDateString()}</span>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#22c55e' }}>₱{Number(e.booking_revenue || 0).toLocaleString()}</div>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{e.booking_count || 0} bookings</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="reports-panel">
          <h3>Conversion Metrics</h3>
          <div className="reports-list">
            <div className="reports-row">
              <span>Conversion Rate</span>
              <strong style={{ color: '#22c55e' }}>{Number(data.conversion?.conversion_rate || 0).toFixed(2)}%</strong>
            </div>
            <div className="reports-row">
              <span>Cancellation Rate</span>
              <strong style={{ color: '#f59e0b' }}>{Number(data.conversion?.cancellation_rate || 0).toFixed(2)}%</strong>
            </div>
            <div className="reports-row">
              <span>Failed Payment Rate</span>
              <strong style={{ color: '#ef4444' }}>{Number(data.conversion?.failed_payment_rate || 0).toFixed(2)}%</strong>
            </div>
            <div className="reports-row">
              <span>Total Bookers</span>
              <strong>{data.conversion?.total_bookers || 0}</strong>
            </div>
          </div>
        </div>
      </section>

      {/* TOP ORGANIZERS & VENUE UTILIZATION */}
      <section className="reports-grid">
        <div className="reports-panel">
          <h3>Top Organizers</h3>
          <div className="reports-table">
            {(data.topOrganizers || []).map((org) => (
              <div key={org.id} className="reports-table-row">
                <span>{org.name}</span>
                <span style={{ color: '#38bdf8' }}>₱{Number(org.total_revenue || 0).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="reports-panel">
          <h3>Venue Utilization</h3>
          <div className="reports-table">
            {(data.venueUtilization || []).map((v) => (
              <div key={v.id} className="reports-table-row">
                <span>{v.name}</span>
                <span style={{ color: '#ec4899' }}>{v.event_count || 0} events</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SUPPORT & PLATFORM METRICS */}
      <section className="reports-grid">
        <div className="reports-panel">
          <h3>Support Overview</h3>
          <div className="reports-list">
            <div className="reports-row"><span>Open Tickets</span><strong>{data.support?.open_tickets || 0}</strong></div>
            <div className="reports-row"><span>Resolved</span><strong style={{ color: '#22c55e' }}>{data.support?.resolved_tickets || 0}</strong></div>
            <div className="reports-row"><span>Closed</span><strong>{data.support?.closed_tickets || 0}</strong></div>
          </div>
        </div>

        <div className="reports-panel">
          <h3>Platform Metrics</h3>
          <div className="reports-list">
            <div className="reports-row"><span>Total Revenue (Payments)</span><strong>₱{Number(data.platform?.total_revenue || 0).toLocaleString()}</strong></div>
            <div className="reports-row"><span>Total Transactions</span><strong>{data.platform?.total_transactions || 0}</strong></div>
            <div className="reports-row"><span>User Types</span><strong>{data.users?.regular_users || 0} users, {data.users?.organizers || 0} organizers</strong></div>
          </div>
        </div>
      </section>
    </main>
  )
}

export default Reports