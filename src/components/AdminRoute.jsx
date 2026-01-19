import { AdminPanel } from './AdminPanel'
import { useNavigate } from 'react-router-dom'

export function AdminRoute() {
    const navigate = useNavigate()

    const handleLogout = () => {
        // Limpiar autenticación de admin
        localStorage.removeItem('adminAuthenticated')

        // Redirigir a página principal (TierSelector si wallet está conectada)
        navigate('/', { replace: true })
    }

    return (
        <div>
            {/* Logout button */}
            <div style={{
                position: 'fixed',
                top: 20,
                right: 20,
                zIndex: 1000
            }}>
                <button
                    onClick={handleLogout}
                    style={{
                        padding: '10px 20px',
                        background: '#ff6b6b',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                    }}
                >
                    🚪 Cerrar Sesión Admin
                </button>
            </div>

            <AdminPanel />
        </div>
    )
}
