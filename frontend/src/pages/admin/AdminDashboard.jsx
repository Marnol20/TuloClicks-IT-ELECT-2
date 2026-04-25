import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Users, CreditCard, UserCheck } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import '../../styles/Dashboard.css'
import StatCard from '../../components/ui/StatCard'
import api from '../../services/api'

function AdminDashboard() {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    organizers: 0,
    pendingEvents: 0,
    totalPayments: 0,
    supportOpen: 0
  })
  const [chartData, setChartData] = useState([])
  const [eventStatusData, setEventStatusData] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  async function fetchDashboardData() {
    try {
      const [org, ev, pay, sup] = await Promise.all([
        api.get('/organizers'),
        api.get('/events/admin/all'),
        api.get('/payments/admin/all'),
        api.get('/support/admin/all')
      ])

      const organizers = org.data || []
      const events = ev.data || []
      const payments = pay.data || []
      const support = sup.data || []

      setStats({
        organizers: organizers.filter(o => o.approval_status === 'approved').length,
        pendingEvents: events.filter(e => e.approval_status === 'pending').length,
        totalPayments: payments.filter(p => p.payment_status === 'success').length,
        supportOpen: support.filter(s => s.status === 'open').length
      })

      // Chart Data: Payments summary (example: last 5 successful payments)
      const payData = payments.slice(0, 5).map((p, index) => ({
        name: `P-${index + 1}`,
        amount: Number(p.amount || p.total_amount || 0)
      }))
      setChartData(payData)

      // Pie Chart Data: Event status breakdown
      setEventStatusData([
        { name: 'Approved', value: events.filter(e => e.approval_status === 'approved').length, color: '#10b981' },
        { name: 'Pending', value: events.filter(e => e.approval_status === 'pending').length, color: '#f59e0b' },
        { name: 'Rejected', value: events.filter(e => e.approval_status === 'rejected').length, color: '#ef4444' }
      ])
    } catch (err) {
      console.error(err)
    }
  }

  const cards = [
    { label: 'Organizers', value: stats.organizers, icon: UserCheck },
    { label: 'Pending Events', value: stats.pendingEvents, icon: CalendarDays },
    { label: 'Payments', value: stats.totalPayments, icon: CreditCard },
    { label: 'Support Issues', value: stats.supportOpen, icon: Users }
  ]

  return (
    <main className="dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-hero-label">Admin overview</p>
          <h1>Run the platform with confidence</h1>
          <p>Track approvals, payments, and support activity from a clean executive dashboard.</p>
        </div>
        <button className="dashboard-btn primary" onClick={() => navigate('/admin/events')}>
          Review Events
        </button>
      </div>

      <div className="stats-grid clean" style={{ marginTop: '20px' }}>
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '20px', marginTop: '30px' }}>
        <div className="reports-panel">
          <h3>Recent Revenue (Success Payments)</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
                <XAxis dataKey="name" stroke="#a0aec0" />
                <YAxis stroke="#a0aec0" />
                <Tooltip contentStyle={{ backgroundColor: '#1a202c', border: 'none' }} />
                <Bar dataKey="amount" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="reports-panel">
          <h3>Event Status Breakdown</h3>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie data={eventStatusData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {eventStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', fontSize: '12px' }}>
              {eventStatusData.map(d => <span key={d.name} style={{ color: d.color }}>● {d.name}</span>)}
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-section" style={{ marginTop: '30px' }}>
        <h3>Quick Actions</h3>
        <div className="quick-grid">
          <button onClick={() => navigate('/admin/organizers')}>Manage Organizers</button>
          <button onClick={() => navigate('/admin/events')}>Approve Events</button>
          <button onClick={() => navigate('/admin/payments')}>View Payments</button>
          <button onClick={() => navigate('/admin/support')}>Support Issues</button>
        </div>
      </div>
    </main>
  )
}

export default AdminDashboard