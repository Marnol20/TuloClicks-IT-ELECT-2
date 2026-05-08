import '../../styles/StatCard.css'

function StatCard({ icon: Icon, iconColor = '#7c3aed', label, value }) {
  return (
    <div className="stat-card modern">

      {/* ICON */}
      <div className="stat-icon" style={{ backgroundColor: iconColor + '20' }}>
        {Icon && <Icon size={20} color={iconColor} />}
      </div>

      {/* TEXT */}
      <div className="stat-content">
        <p className="stat-label">{label}</p>
        <h3 className="stat-value">{value}</h3>
      </div>

    </div>
  )
}

export default StatCard