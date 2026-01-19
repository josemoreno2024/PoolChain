import { useState, useEffect } from 'react'
import './Tooltip.css'

export default function Tooltip({ children, text, position = 'top' }) {
    const [isVisible, setIsVisible] = useState(false)

    // Cerrar tooltip al hacer clic fuera (móvil)
    useEffect(() => {
        if (!isVisible) return

        const handleClickOutside = () => setIsVisible(false)
        document.addEventListener('click', handleClickOutside)
        return () => document.removeEventListener('click', handleClickOutside)
    }, [isVisible])

    const handleClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsVisible(!isVisible)
    }

    return (
        <div className="tooltip-container">
            <button
                className="tooltip-trigger"
                onMouseEnter={() => setIsVisible(true)}
                onMouseLeave={() => setIsVisible(false)}
                onClick={handleClick}
                type="button"
                aria-label="Ayuda"
            >
                {children || '?'}
            </button>
            {isVisible && (
                <div
                    className={`tooltip-content tooltip-${position}`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {text}
                </div>
            )}
        </div>
    )
}
