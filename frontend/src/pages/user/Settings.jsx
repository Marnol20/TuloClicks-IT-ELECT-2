import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Lock, Palette, Globe, Save, KeyRound } from 'lucide-react'
import { useTheme } from '../../components/common/ThemeContext'
import { useToast } from '../../components/common/ToastContext' // Import toast
import '../../styles/Settings.css'
import api from '../../services/api' // Import api

function SettingsPage() {
  const navigate = useNavigate()
  const { addToast } = useToast()
  const { theme, setTheme: setAppTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('appearance')
  const [message, setMessage] = useState({ type: '', text: '' })
  const [loading, setLoading] = useState(false)

  // New State for Password Change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('userSettings')
    return saved ? JSON.parse(saved) : {
      email_notifications: true,
      sms_notifications: false,
      event_reminders: true,
      marketing_emails: false,
      theme: 'dark',
      language: 'en',
      two_factor_auth: false
    }
  })

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language', icon: Globe }
  ]

  // NEW: Handle Password Change Submission
  async function handlePasswordChange(e) {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      addToast('New passwords do not match', 'error')
      return
    }

    if (passwordData.newPassword.length < 8) {
      addToast('New password must be at least 8 characters', 'warning')
      return
    }

    try {
      setLoading(true)
      await api.post('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })
      
      addToast('Password updated successfully!', 'success')
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
    } catch (err) {
      addToast(err.response?.data?.error || 'Failed to update password', 'error')
    } finally {
      setLoading(false)
    }
  }

  function handleSave() {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    setAppTheme(settings.theme)
    addToast('Settings saved successfully!', 'success')
  }

  function handleChange(field, value) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    setAppTheme(settings.theme)
  }, [settings, setAppTheme])

  return (
    <div className="settings-page">
      <div className="settings-page-hero">
        <p className="settings-hero-eyebrow">Account</p>
        <h1 className="settings-hero-title">Settings</h1>
        <p className="settings-hero-sub">Customize your preferences and account security.</p>
      </div>

      <div className="settings-container">
        <div className="settings-layout">
          <nav className="settings-tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`settings-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <tab.icon size={18} />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>

          <div className="settings-content">
            {activeTab === 'notifications' && (
              <div className="settings-section">
                <h2>Notification Preferences</h2>
                <p className="settings-section-desc">Manage how you receive notifications from TuloClicks.</p>
                <div className="settings-toggle-group">
                  <div className="settings-toggle-item">
                    <div><h4>Email Notifications</h4><p>Receive updates via email</p></div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={settings.email_notifications} onChange={(e) => handleChange('email_notifications', e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="settings-toggle-item">
                    <div><h4>SMS Notifications</h4><p>Receive updates via SMS</p></div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={settings.sms_notifications} onChange={(e) => handleChange('sms_notifications', e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="settings-toggle-item">
                    <div><h4>Event Reminders</h4><p>Get reminded before events start</p></div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={settings.event_reminders} onChange={(e) => handleChange('event_reminders', e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  <div className="settings-toggle-item">
                    <div><h4>Marketing Emails</h4><p>Receive promotional content</p></div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={settings.marketing_emails} onChange={(e) => handleChange('marketing_emails', e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>Security Settings</h2>
                <p className="settings-section-desc">Manage your account security and update your password.</p>

                {/* Password Change Form Integrated Here */}
                <form className="settings-password-form" onSubmit={handlePasswordChange} style={{ marginTop: '20px' }}>
                  <div className="settings-input-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Current Password</label>
                    <input
                      type="password"
                      className="settings-input"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: 'white' }}
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="settings-input-group" style={{ marginBottom: '15px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>New Password</label>
                    <input
                      type="password"
                      className="settings-input"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: 'white' }}
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      required
                    />
                  </div>
                  <div className="settings-input-group" style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>Confirm New Password</label>
                    <input
                      type="password"
                      className="settings-input"
                      style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #333', background: '#1a1a1a', color: 'white' }}
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      required
                    />
                  </div>
                  <button type="submit" className="settings-save-btn" disabled={loading} style={{ background: '#8b5cf6', width: 'auto' }}>
                    <KeyRound size={16} /> {loading ? 'Updating...' : 'Update Password'}
                  </button>
                </form>

                <hr style={{ margin: '30px 0', borderColor: '#333' }} />

                <div className="settings-toggle-group">
                  <div className="settings-toggle-item">
                    <div><h4>Two-Factor Authentication</h4><p>Add an extra layer of security</p></div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={settings.two_factor_auth} onChange={(e) => handleChange('two_factor_auth', e.target.checked)} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h2>Appearance</h2>
                <p className="settings-section-desc">Customize how TuloClicks looks for you.</p>
                <div className="settings-option-group">
                  <h4>Theme</h4>
                  <div className="settings-theme-options">
                    <button className={`settings-theme-option ${settings.theme === 'dark' ? 'active' : ''}`} onClick={() => handleChange('theme', 'dark')}>
                      <div className="theme-preview dark"></div><span>Dark</span>
                    </button>
                    <button className={`settings-theme-option ${settings.theme === 'light' ? 'active' : ''}`} onClick={() => handleChange('theme', 'light')}>
                      <div className="theme-preview light"></div><span>Light</span>
                    </button>
                    <button className={`settings-theme-option ${settings.theme === 'system' ? 'active' : ''}`} onClick={() => handleChange('theme', 'system')}>
                      <div className="theme-preview system"></div><span>System</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="settings-section">
                <h2>Language & Region</h2>
                <div className="settings-select-group">
                  <h4>Language</h4>
                  <select value={settings.language} onChange={(e) => handleChange('language', e.target.value)} className="settings-select">
                    <option value="en">English</option>
                    <option value="fil">Filipino</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button className="settings-save-btn" onClick={handleSave}><Save size={18} /> Save Changes</button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage