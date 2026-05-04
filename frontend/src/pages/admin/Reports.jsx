import { useEffect, useState, useRef} from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'
import { Download, Calendar } from 'lucide-react'
import '../../styles/Reports.css'
import api from '../../services/api'
import { useToast } from '../../components/common/ToastContext'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

function Reports() {
  const { addToast } = useToast()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [startDate, setStartDate] = useState(getDefaultStartDate())
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedPreset, setSelectedPreset] = useState('last30')

  const reportRef = useRef(null)

  function getDefaultStartDate() {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().split('T')[0]
  }

  function applyPreset(preset) {
    const today = new Date()
    const end = today.toISOString().split('T')[0]
    let start

    switch (preset) {
      case 'today':
        start = end
        break
      case 'last7':
        start = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'last30':
        start = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'last90':
        start = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      case 'last365':
        start = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        break
      default:
        return
    }

    setStartDate(start)
    setEndDate(end)
    setSelectedPreset(preset)
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
    setSelectedPreset('custom')
    fetchReports()
  }

  function getDaysInRange() {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  }

  async function exportToPDF() {
    if (!reportRef.current) return;

    try {
      addToast('Generating full report...', 'info');
      
      const element = reportRef.current;
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#0f172a',
        windowHeight: element.scrollHeight, 
        scrollY: -window.scrollY 
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = 210; // Standard A4 width in mm
      const pageHeight = 297; // Standard A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', [imgWidth, imgHeight]);

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`System_Analytics_${new Date().toISOString().split('T')[0]}.pdf`);
      
      addToast('Full PDF Downloaded', 'success');
    } catch (err) {
      console.error("PDF Error:", err);
      addToast('PDF Export failed', 'error');
    }
  }

  function exportToCSV() {
    if (!data) return;

    try {
      let csvRows = [];

      // 1. Summary Metrics Section
      csvRows.push(["--- SUMMARY METRICS ---"]);
      csvRows.push(["Metric", "Value"]);
      csvRows.push(["Total Revenue", data.revenue?.total_revenue || 0]);
      csvRows.push(["Total Bookings", data.revenue?.total_bookings || 0]);
      csvRows.push(["Total Users", data.users?.total_users || 0]);
      csvRows.push(["Approved Events", data.events?.approved_events || 0]);
      csvRows.push([]); 

      // 2. Top Events Table Section
      csvRows.push(["--- TOP EVENTS ---"]);
      csvRows.push(["Event Title", "Start Date", "Revenue", "Bookings"]);
      
      if (data.topEvents && data.topEvents.length > 0) {
        data.topEvents.forEach(e => {
          csvRows.push([
            `"${e.title.replace(/"/g, '""')}"`, // Escape quotes
            new Date(e.start_date).toLocaleDateString(),
            e.booking_revenue,
            e.booking_count
          ]);
        });
      }

      // Convert to string
      const csvContent = csvRows.map(row => row.join(",")).join("\n");
      
      // Download Logic
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `Report_${startDate}_to_${endDate}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      addToast('CSV Downloaded', 'success');
    } catch (err) {
      addToast('CSV Export failed', 'error');
    }
  }

  if (loading) return <div className="reports-empty">Analyzing system data...</div>
  if (!data) return <div className="reports-empty">Failed to load system reports.</div>

  const pieColors = ['#8b5cf6', '#22c55e', '#f59e0b', '#ef4444', '#38bdf8', '#ec4899']

  return (
    <main className="reports-page" ref={reportRef}>
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

       {/* IMPROVED DATE RANGE FILTER */}
      <section className="reports-filter-section">
        {/* Preset Buttons */}
        <div className="filter-presets">
          <button 
            className={`preset-btn ${selectedPreset === 'today' ? 'active' : ''}`}
            onClick={() => applyPreset('today')}
          >
            Today
          </button>
          <button 
            className={`preset-btn ${selectedPreset === 'last7' ? 'active' : ''}`}
            onClick={() => applyPreset('last7')}
          >
            Last 7 Days
          </button>
          <button 
            className={`preset-btn ${selectedPreset === 'last30' ? 'active' : ''}`}
            onClick={() => applyPreset('last30')}
          >
            Last 30 Days
          </button>
          <button 
            className={`preset-btn ${selectedPreset === 'last90' ? 'active' : ''}`}
            onClick={() => applyPreset('last90')}
          >
            Last 90 Days
          </button>
          <button 
            className={`preset-btn ${selectedPreset === 'last365' ? 'active' : ''}`}
            onClick={() => applyPreset('last365')}
          >
            Last Year
          </button>
        </div>

        {/* Custom Date Range */}
        <div className="reports-filter">
          <div className="filter-group">
            <label><Calendar size={16} /> Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => {
                setStartDate(e.target.value)
                setSelectedPreset('custom')
              }} 
            />
          </div>
          <div className="filter-group">
            <label><Calendar size={16} /> End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => {
                setEndDate(e.target.value)
                setSelectedPreset('custom')
              }} 
            />
          </div>
          <button onClick={handleDateFilter} className="reports-filter-btn">Apply Filter</button>
        </div>

        {/* Date Range Summary */}
        <div className="date-range-summary">
          <div className="summary-item">
            <span className="summary-label">Showing data for:</span>
            <span className="summary-value">
              {new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' '} → {' '}
              {new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Period:</span>
            <span className="summary-value">{getDaysInRange()} days</span>
          </div>
        </div>
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