import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, ShieldCheck, Eye, FileText } from 'lucide-react' // Added ShieldCheck, Eye, FileText
import { useToast } from '../../components/common/ToastContext'
import '../../styles/Attendees.css'
import '../../styles/AdminPages.css'
import api from '../../services/api'

function OrganizerApprovals() {
  const { addToast } = useToast()
  const [organizers, setOrganizers] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  // NEW INTERACTIVE STATE: State variables configured for managing identity preview credentials modal overlays
  const [selectedProfile, setSelectedProfile] = useState(null)
  const [showPreviewModal, setShowPreviewModal] = useState(false)

  useEffect(() => { fetchOrganizers() }, [])

  async function fetchOrganizers() {
    try {
      setLoading(true)
      const res = await api.get('/organizers')
      setOrganizers(res.data || [])
    } catch {
      setOrganizers([])
    } finally {
      setLoading(false)
    }
  }

  async function handleStatusChange(id, status) {
    let reason = ''
    if (status === 'rejected') {
      reason = window.prompt('Enter rejection reason:', 'Application does not meet requirements.')
      if (reason === null) return
    }
    if (!window.confirm(`Are you sure you want to ${status} this organizer?`)) return

    setActionLoading(true)
    try {
      const endpoint = status === 'approved' ? 'approve' : 'reject'
      await api.patch(`/organizers/${id}/${endpoint}`, { rejection_reason: reason })
      addToast(`Organizer ${status} successfully`, 'success')
      setShowPreviewModal(false) // Automatically close active modal cards once processing terminates successfully
      fetchOrganizers()
    } catch (err) {
      addToast(err.response?.data?.error || `Failed to ${status} organizer`, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  // NEW METHOD: Activates interactive popup window elements mapping specific attachment records
  const handleReviewCredentials = (profile) => {
    setSelectedProfile(profile)
    setShowPreviewModal(true)
  }

  const pending  = organizers.filter((o) => o.approval_status === 'pending').length
  const approved = organizers.filter((o) => o.approval_status === 'approved').length
  const rejected = organizers.filter((o) => o.approval_status === 'rejected').length

  return (
    <main className="admin-page">
      {/* NEW INTERACTIVE OVERLAY MODAL: Glassmorphic popup review container checking uploaded valid IDs manual layouts */}
      {showPreviewModal && selectedProfile && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(6, 10, 22, 0.88)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#0f172a',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '30px',
            maxWidth: '550px',
            width: '100%',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #1e293b', paddingBottom: '15px' }}>
              <ShieldCheck size={26} color="#8b5cf6" />
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', color: '#f8fafc', margin: 0 }}>Review Account Documentation</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '25px', color: '#cbd5e1', fontSize: '14px' }}>
              <p style={{ margin: 0 }}><strong>Organization:</strong> {selectedProfile.organization_name}</p>
              <p style={{ margin: 0 }}><strong>Applicant Name:</strong> {selectedProfile.user_name}</p>
              <p style={{ margin: 0 }}><strong>Account Email:</strong> {selectedProfile.email}</p>
              <p style={{ margin: 0 }}><strong>Organization Type:</strong> {selectedProfile.organization_type || 'N/A'}</p>
              {selectedProfile.rejection_reason && (
                <p style={{ margin: 0, color: '#ef4444' }}><strong>Previous Feedback:</strong> {selectedProfile.rejection_reason}</p>
              )}
            </div>

            {/* VALID ID CONTAINER LINK VIEW: Renders clear image frames extracting files directly out of backend storage parameters */}
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#94a3b8', marginBottom: '8px' }}>Uploaded Institutional ID Attachment</label>
              <div style={{ width: '100%', height: '220px', borderRadius: '8px', backgroundColor: '#020617', border: '1px solid #1e293b', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {selectedProfile.branding_logo ? (
                  <img 
                    src={`${import.meta.env.VITE_API_URL}/uploads/ids/${selectedProfile.branding_logo}`}
                    alt="Valid ID Proof"
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.style.display = 'none';
                      e.target.parentNode.innerHTML = '<span style="color:#ef4444;font-size:13px;">Error rendering attachment file image context bounds.</span>';
                    }}
                  />
                ) : (
                  <span style={{ color: '#64748b', fontSize: '13px' }}>No verification ID attachment detected.</span>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              {selectedProfile.approval_status === 'pending' && (
                <>
                  <button 
                    style={{ flex: 1, backgroundColor: '#10b981', color: '#ffffff', fontWeight: 'bold', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handleStatusChange(selectedProfile.id, 'approved')}
                    disabled={actionLoading}
                  >
                    <CheckCircle size={15} /> Approve Account
                  </button>
                  <button 
                    style={{ flex: 1, backgroundColor: '#ef4444', color: '#ffffff', fontWeight: 'bold', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                    onClick={() => handleStatusChange(selectedProfile.id, 'rejected')}
                    disabled={actionLoading}
                  >
                    <XCircle size={15} /> Reject
                  </button>
                </>
              )}
              <button 
                type="button"
                style={{ flex: selectedProfile.approval_status === 'pending' ? '0.6' : '1', backgroundColor: '#334155', color: '#ffffff', padding: '12px', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                onClick={() => { setShowPreviewModal(false); setSelectedProfile(null); }}
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-hero">
        <div className="admin-hero-bg" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=80')" }} />
        <div className="admin-hero-overlay" style={{ background: 'linear-gradient(160deg,rgba(59,130,246,0.4) 0%,rgba(6,10,22,0.5) 60%),linear-gradient(0deg,rgba(6,10,22,0.92) 0%,transparent 60%)' }} />
        <div>
          <h2>Organizer Approvals</h2>
          <p>Review and verify organizer applications submitted through the platform.</p>
        </div>
        <div className="admin-hero-stats">
          <div className="admin-hero-stat yellow">
            <span className="admin-hero-stat-val">{pending}</span>
            <span className="admin-hero-stat-label">Pending</span>
          </div>
          <div className="admin-hero-stat green">
            <span className="admin-hero-stat-val">{approved}</span>
            <span className="admin-hero-stat-label">Approved</span>
          </div>
          <div className="admin-hero-stat red">
            <span className="admin-hero-stat-val">{rejected}</span>
            <span className="admin-hero-stat-label">Rejected</span>
          </div>
        </div>
      </div>

      <div className="attendees-table">
        <div className="table-header" style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.85fr 1.4fr' }}>
          <span>Organization</span>
          <span>Applicant</span>
          <span>Type</span>
          <span>Email</span>
          <span>Status</span>
          <span>Actions</span>
        </div>

        {loading ? (
          <div className="table-empty">Loading applications…</div>
        ) : organizers.length === 0 ? (
          <div className="table-empty">No organizer applications found.</div>
        ) : (
          organizers.map((item) => (
            <div
              key={item.id}
              className="table-row"
              style={{ gridTemplateColumns: '1.2fr 1fr 1fr 1fr 0.85fr 1.4fr', opacity: actionLoading ? 0.6 : 1 }}
            >
              <span className="row-name">{item.organization_name}</span>
              <span className="row-muted">{item.user_name}</span>
              <span className="row-muted">{item.organization_type || 'N/A'}</span>
              <span className="row-muted">{item.email}</span>

              <span className={`table-badge ${
                item.approval_status === 'approved' ? 'success'
                : item.approval_status === 'rejected' ? 'danger'
                : 'warning'
              }`}>
                {item.approval_status}
              </span>

              <div className="row-actions" style={{ gap: '6px' }}>
                {/* NEW COMPONENT TRIGGER: Clickable control to render file attachments on real-time popup wrappers */}
                <button
                  type="button"
                  className="table-action-btn"
                  style={{ backgroundColor: '#1e293b', color: '#e2e8f0', border: '1px solid #475569', padding: '4px 10px', borderRadius: '6px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                  onClick={() => handleReviewCredentials(item)}
                >
                  <Eye size={12} /> Credentials
                </button>

                {item.approval_status === 'pending' && (
                  <>
                    <button
                      className="table-action-btn success"
                      onClick={() => handleStatusChange(item.id, 'approved')}
                      disabled={actionLoading}
                    >
                      <CheckCircle size={13} /> Approve
                    </button>
                    <button
                      className="table-action-btn danger"
                      onClick={() => handleStatusChange(item.id, 'rejected')}
                      disabled={actionLoading}
                    >
                      <XCircle size={13} /> Reject
                    </button>
                  </>
                )}
                {item.approval_status === 'approved' && (
                  <span className="admin-verified-badge">
                    <CheckCircle size={12} /> Verified
                  </span>
                )}
                {item.approval_status === 'rejected' && (
                  <span className="admin-rejected-badge">
                    <XCircle size={12} /> Rejected
                  </span>
                )}
              </div>
            </div>
          ))) }
      </div>
    </main>
  )
}

export default OrganizerApprovals