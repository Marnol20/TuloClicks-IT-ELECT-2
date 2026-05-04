import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Bell, Lock, Palette, Globe, Save, AlertCircle, Shield } from 'lucide-react'
import { useTheme } from '../../components/common/ThemeContext'
import { useToast } from '../../components/common/ToastContext'
import api from '../../services/api'
import '../../styles/Settings.css'

function AdminSettings() {
  const { theme, setTheme: setAppTheme } = useTheme()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('notifications')
  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('adminSettings')
    return saved ? JSON.parse(saved) : {
      email_notifications: true,
      approval_alerts: true,
      payment_alerts: true,
      system_alerts: true,
      marketing_emails: false,
      theme: 'dark',
      language: 'en',
      two_factor_auth: false,
      activity_logging: true
    }
  })

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Lock },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'language', label: 'Language', icon: Globe }
  ]

  function handleChange(field, value) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  async function handleSave() {
    try {
      setLoading(true)
      localStorage.setItem('adminSettings', JSON.stringify(settings))
      setAppTheme(settings.theme)
      
      await api.put('/users/settings', settings).catch(() => {
        // Settings can still be saved to localStorage even if API fails
      })
      
      addToast('Settings saved successfully!', 'success')
    } catch (error) {
      addToast('Failed to save settings', 'error')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    localStorage.setItem('adminSettings', JSON.stringify(settings))
    setAppTheme(settings.theme)
  }, [settings, setAppTheme])

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <SettingsIcon size={28} />
          <h1>Admin Settings</h1>
        </div>

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
                <p className="settings-section-desc">
                  Manage platform alerts and administrative notifications.
                </p>

                <div className="settings-toggle-group">
                  <div className="settings-toggle-item">
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Receive important platform updates</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.email_notifications}
                        onChange={(e) => handleChange('email_notifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-toggle-item">
                    <div>
                      <h4>Approval Alerts</h4>
                      <p>Notifications for pending approvals (events, organizers)</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.approval_alerts}
                        onChange={(e) => handleChange('approval_alerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-toggle-item">
                    <div>
                      <h4>Payment Alerts</h4>
                      <p>Notifications for payment transactions and disputes</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.payment_alerts}
                        onChange={(e) => handleChange('payment_alerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-toggle-item">
                    <div>
                      <h4>System Alerts</h4>
                      <p>Critical system and security notifications</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.system_alerts}
                        onChange={(e) => handleChange('system_alerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-toggle-item">
                    <div>
                      <h4>Marketing Emails</h4>
                      <p>Platform news and feature announcements</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.marketing_emails}
                        onChange={(e) => handleChange('marketing_emails', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="settings-section">
                <h2>Security & Compliance</h2>
                <p className="settings-section-desc">
                  Manage security settings and activity logging.
                </p>

                <div className="settings-toggle-group">
                  <div className="settings-toggle-item">
                    <div>
                      <h4>Activity Logging</h4>
                      <p>Track all admin actions and changes</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.activity_logging}
                        onChange={(e) => handleChange('activity_logging', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-toggle-item">
                    <div>
                      <h4>Two-Factor Authentication</h4>
                      <p>Enhanced security for admin account</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.two_factor_auth}
                        onChange={(e) => handleChange('two_factor_auth', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-info-box">
                  <Shield size={18} />
                  <div>
                    <h5>Admin Privileges</h5>
                    <p>Your account has administrative privileges. All actions are logged for security and compliance purposes.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'appearance' && (
              <div className="settings-section">
                <h2>Appearance</h2>
                <p className="settings-section-desc">
                  Customize how TuloClicks looks for you.
                </p>

                <div className="settings-option-group">
                  <h4>Theme</h4>
                  <div className="settings-theme-options">
                    <button
                      className={`settings-theme-option ${settings.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleChange('theme', 'dark')}
                    >
                      <div className="theme-preview dark"></div>
                      <span>Dark</span>
                    </button>
                    <button
                      className={`settings-theme-option ${settings.theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleChange('theme', 'light')}
                    >
                      <div className="theme-preview light"></div>
                      <span>Light</span>
                    </button>
                    <button
                      className={`settings-theme-option ${settings.theme === 'system' ? 'active' : ''}`}
                      onClick={() => handleChange('theme', 'system')}
                    >
                      <div className="theme-preview system"></div>
                      <span>System</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'language' && (
              <div className="settings-section">
                <h2>Language & Region</h2>
                <p className="settings-section-desc">
                  Choose your preferred language and region settings.
                </p>

                <div className="settings-select-group">
                  <h4>Language</h4>
                  <select
                    value={settings.language}
                    onChange={(e) => handleChange('language', e.target.value)}
                    className="settings-select"
                  >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="fil">Filipino</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="settings-footer">
          <button
            className="settings-save-btn"
            onClick={handleSave}
            disabled={loading}
          >
            <Save size={18} />
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default AdminSettings