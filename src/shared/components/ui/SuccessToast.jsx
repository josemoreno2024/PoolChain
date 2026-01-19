import './SuccessToast.css'
import { useEffect } from 'react'

export default function SuccessToast({ message, isVisible, onClose, duration = 4000 }) {
    useEffect(() => {
        if (isVisible && onClose) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            return () => clearTimeout(timer)
        }
    }, [isVisible, onClose, duration])

    if (!isVisible) return null

    return (
        <div className="success-toast">
            <div className="success-toast-icon">✅</div>
            <div className="success-toast-message">{message}</div>
        </div>
    )
}
