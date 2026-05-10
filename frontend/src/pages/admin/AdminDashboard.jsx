import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Users, CreditCard, UserCheck, MessageSquare } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import '../../styles/Dashboard.css'
import '../../styles/AdminPages.css'
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

      const payData = payments.slice(0, 5).map((p, index) => ({
        name: `P-${index + 1}`,
        amount: Number(p.amount || p.total_amount || 0)
      }))
      setChartData(payData)

      setEventStatusData([
        { name: 'Approved', value: events.filter(e => e.approval_status === 'approved').length, color: '#10b981' },
        { name: 'Pending',  value: events.filter(e => e.approval_status === 'pending').length,  color: '#f59e0b' },
        { name: 'Rejected', value: events.filter(e => e.approval_status === 'rejected').length, color: '#ef4444' }
      ])
    } catch (err) {
      console.error(err)
    }
  }

  const cards = [
    { label: 'Organizers',     value: stats.organizers,     icon: UserCheck,     iconColor: '#22c55e' },
    { label: 'Pending Events', value: stats.pendingEvents,  icon: CalendarDays,  iconColor: '#f59e0b' },
    { label: 'Payments',       value: stats.totalPayments,  icon: CreditCard,    iconColor: '#8b5cf6' },
    { label: 'Support Issues', value: stats.supportOpen,    icon: MessageSquare, iconColor: '#ef4444' }
  ]

  const quickActions = [
    { label: 'Manage Organizers', sub: 'Review and approve organizers', icon: Users,        path: '/admin/organizers' },
    { label: 'Approve Events',    sub: 'Review pending event submissions', icon: CalendarDays, path: '/admin/events'      },
    { label: 'View Payments',     sub: 'Track payment records',          icon: CreditCard,   path: '/admin/payments'    },
    { label: 'Support Issues',    sub: 'Handle open support tickets',    icon: MessageSquare, path: '/admin/support'     }
  ]

  return (
    <main className="dashboard">
      <div className="dashboard-hero">
        <div>
          <p className="dashboard-hero-label">Admin Overview</p>
          <h1>Run the platform with confidence</h1>
          <p>Track approvals, payments, and support activity from a clean executive dashboard.</p>
        </div>
        <button className="dashboard-btn primary" onClick={() => navigate('/admin/events')}>
          Review Events →
        </button>
      </div>

      <div className="stats-grid clean">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} iconColor={c.iconColor} />
        ))}
      </div>

      <div className="admin-charts-grid">
        <div className="reports-panel">
          <h3>Recent Revenue (Success Payments)</h3>
          {/* UPDATED: Gi-wrap og div nga adunay fixed height para sa Recharts */}
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <defs>
                  <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.7} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="name" stroke="#475569" tick={{ fontSize: 12 }} />
                <YAxis stroke="#475569" tick={{ fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 13 }}
                  cursor={{ fill: 'rgba(139,92,246,0.08)' }}
                />
                <Bar dataKey="amount" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="reports-panel">
          <h3>Event Status Breakdown</h3>
          {/* UPDATED: Gi-wrap og div nga adunay fixed height para sa Recharts */}
          <div style={{ width: '100%', height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventStatusData}
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {eventStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', fontSize: 13 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="admin-pie-legend">
            {eventStatusData.map(d => (
              <span key={d.name} className="admin-pie-legend-item" style={{ color: d.color }}>● {d.name}</span>
            ))}
          </div>
        </div>
      </div>

      <div className="dashboard-section">
        <h3>Quick Actions</h3>
        <div className="quick-grid">
          {quickActions.map(({ label, sub, icon: Icon, path }) => (
            <button key={label} onClick={() => navigate(path)}>
              <div className="quick-action-icon">
                <Icon size={18} color="#a78bfa" />
              </div>
              <span className="quick-action-label">{label}</span>
              <span className="quick-action-sub">{sub}</span>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}

export default AdminDashboard