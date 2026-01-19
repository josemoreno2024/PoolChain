import { useState, useRef, useEffect } from 'react';
import './InfoTooltip.css';

export function InfoTooltip({ text, position = 'top' }) {
    const [show, setShow] = useState(false);
    const [coords, setCoords] = useState({ left: 0, top: 0 });
    const triggerRef = useRef(null);

    useEffect(() => {
        if (show && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            setCoords({
                left: rect.left + rect.width / 2,
                top: rect.top
            });
        }
    }, [show]);

    return (
        <div className="info-tooltip-container">
            <button
                ref={triggerRef}
                className="info-tooltip-trigger"
                onMouseEnter={() => setShow(true)}
                onMouseLeave={() => setShow(false)}
                onClick={(e) => {
                    e.preventDefault();
                    setShow(!show);
                }}
                type="button"
            >
                ?
            </button>
            {show && (
                <div
                    className={`info-tooltip-content ${position}`}
                    style={{ left: `${coords.left}px`, top: `${coords.top}px` }}
                >
                    {text}
                </div>
            )}
        </div>
    );
}
