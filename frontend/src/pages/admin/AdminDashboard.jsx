import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Users, CreditCard, UserCheck } from 'lucide-react'
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
          <p>
            Track approvals, payments, and support activity from a clean executive dashboard designed for fast decisions.
          </p>
        </div>

        <button
          className="dashboard-btn primary"
          onClick={() => navigate('/admin/events')}
        >
          Review Events
        </button>
      </div>

      <div className="dashboard-header clean">
        <div>
          <h2>Key Metrics</h2>
          <p>Live platform summary</p>
        </div>
      </div>

      <div className="stats-grid clean">
        {cards.map((c) => (
          <StatCard key={c.label} label={c.label} value={c.value} icon={c.icon} />
        ))}
      </div>

      <div className="dashboard-section">
        <h3>Quick Actions</h3>

        <div className="quick-grid">
          <button onClick={() => navigate('/admin/organizers')}>
            Manage Organizers
          </button>

          <button onClick={() => navigate('/admin/events')}>
            Approve Events
          </button>

          <button onClick={() => navigate('/admin/payments')}>
            View Payments
          </button>

          <button onClick={() => navigate('/admin/support')}>
            Support Issues
          </button>
        </div>
      </div>
    </main>
  )
}

export default AdminDashboard