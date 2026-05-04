import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Bell, Lock, Palette, Globe, Save, AlertCircle } from 'lucide-react'
import { useTheme } from '../../components/common/ThemeContext'
import { useToast } from '../../components/common/ToastContext'
import api from '../../services/api'
import '../../styles/Settings.css'

function OrganizerSettings() {
  const { theme, setTheme: setAppTheme } = useTheme()
  const { addToast } = useToast()
  const [activeTab, setActiveTab] = useState('notifications')
  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem('organizerSettings')
    return saved ? JSON.parse(saved) : {
      email_notifications: true,
      booking_alerts: true,
      event_reminders: true,
      marketing_emails: false,
      theme: 'dark',
      language: 'en',
      auto_approve_bookings: false
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
      localStorage.setItem('organizerSettings', JSON.stringify(settings))
      setAppTheme(settings.theme)
      
      // Save to backend if needed
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
    localStorage.setItem('organizerSettings', JSON.stringify(settings))
    setAppTheme(settings.theme)
  }, [settings, setAppTheme])

  return (
    <div className="settings-page">
      <div className="settings-container">
        <div className="settings-header">
          <SettingsIcon size={28} />
          <h1>Settings</h1>
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
                  Manage how you receive event and booking notifications.
                </p>

                <div className="settings-toggle-group">
                  <div className="settings-toggle-item">
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Receive important updates via email</p>
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
                      <h4>Booking Alerts</h4>
                      <p>Get notified when users book tickets</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.booking_alerts}
                        onChange={(e) => handleChange('booking_alerts', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-toggle-item">
                    <div>
                      <h4>Event Reminders</h4>
                      <p>Reminders before your events start</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.event_reminders}
                        onChange={(e) => handleChange('event_reminders', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-toggle-item">
                    <div>
                      <h4>Marketing Emails</h4>
                      <p>Receive promotional content and tips</p>
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
                <h2>Security Settings</h2>
                <p className="settings-section-desc">
                  Manage your account security and booking controls.
                </p>

                <div className="settings-toggle-group">
                  <div className="settings-toggle-item">
                    <div>
                      <h4>Auto-Approve Bookings</h4>
                      <p>Automatically approve new ticket bookings</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.auto_approve_bookings}
                        onChange={(e) => handleChange('auto_approve_bookings', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                </div>

                <div className="settings-info-box">
                  <AlertCircle size={18} />
                  <div>
                    <h5>Account Security</h5>
                    <p>Your account is protected with your login credentials. Never share your password with anyone.</p>
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

export default OrganizerSettings