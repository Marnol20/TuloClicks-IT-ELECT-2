import { useState, useEffect, useRef } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import '../../styles/ToastNotification.css'

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle
}

export default function ToastNotification({ message, type = 'info', duration = 5000, onClose }) {
  const [timeLeft, setTimeLeft] = useState(duration / 1000)
  const [isVisible, setIsVisible] = useState(false)
  const timerRef = useRef(null)

  const Icon = icons[type] || icons.info

  useEffect(() => {
    // Trigger entrance animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })

    // Countdown timer
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          handleClose()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  function handleClose() {
    setIsVisible(false)
    setTimeout(() => {
      onClose?.()
    }, 300) // Wait for exit animation
  }

  return (
    <div className={`toast-notification ${type} ${isVisible ? 'visible' : 'hidden'}`}>
      <div className="toast-icon">
        <Icon size={20} />
      </div>
      <div className="toast-content">
        <p className="toast-message">{message}</p>
        <span className="toast-timer">{timeLeft}s</span>
      </div>
      <button className="toast-close" onClick={handleClose}>
        <X size={16} />
      </button>
    </div>
  )
}
