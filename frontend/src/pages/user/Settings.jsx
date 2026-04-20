import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Settings as SettingsIcon, Bell, Lock, Palette, Globe, Save } from 'lucide-react'
import { useTheme } from '../../components/common/ThemeContext'
import '../../styles/Settings.css'

function SettingsPage() {
  const navigate = useNavigate()
  const { theme, setTheme: setAppTheme } = useTheme()
  const [activeTab, setActiveTab] = useState('appearance') // Start on appearance tab
  const [message, setMessage] = useState({ type: '', text: '' })

  // Load settings from localStorage or use defaults
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

  function handleSave() {
    localStorage.setItem('userSettings', JSON.stringify(settings))
    setAppTheme(settings.theme) // Apply theme immediately
    setMessage({ type: 'success', text: 'Settings saved successfully!' })
  }

  function handleChange(field, value) {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  // Auto-save settings to localStorage and apply theme
  useEffect(() => {
    localStorage.setItem('userSettings', JSON.stringify(settings))
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
                  Manage how you receive notifications from TuloClicks.
                </p>

                <div className="settings-toggle-group">
                  <div className="settings-toggle-item">
                    <div>
                      <h4>Email Notifications</h4>
                      <p>Receive updates via email</p>
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
                      <h4>SMS Notifications</h4>
                      <p>Receive updates via SMS</p>
                    </div>
                    <label className="toggle-switch">
                      <input
                        type="checkbox"
                        checked={settings.sms_notifications}
                        onChange={(e) => handleChange('sms_notifications', e.target.checked)}
                      />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>

                  <div className="settings-toggle-item">
                    <div>
                      <h4>Event Reminders</h4>
                      <p>Get reminded before events start</p>
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
                      <p>Receive promotional content</p>
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
                  Manage your account security and authentication.
                </p>

                <div className="settings-toggle-group">
                  <div className="settings-toggle-item">
                    <div>
                      <h4>Two-Factor Authentication</h4>
                      <p>Add an extra layer of security</p>
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

                {/* <div className="settings-action-buttons">
                  <button
                    className="settings-action-btn"
                    onClick={() => navigate('/home/change-password')}
                  >
                    Change Password
                  </button>
                </div> */}
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
                    <option value="de">German</option>
                    <option value="fil">Filipino</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>

        {message.text && (
          <div className={`settings-message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="settings-footer">
          <button
            className="settings-save-btn"
            onClick={handleSave}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPage
