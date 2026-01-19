import Tooltip from './Tooltip'
import './StatCard.css'

export default function StatCard({ label, value, highlight = false, tooltip }) {
    return (
        <div className={`stat-card card ${highlight ? 'highlight' : ''}`}>
            <div className="stat-label">
                {label}
                {tooltip && <Tooltip text={tooltip} />}
            </div>
            <div className="stat-value">{value}</div>
        </div>
    )
}
