import { Link } from 'react-router-dom';
import { WalletConnect } from './WalletConnect';

export function Header() {
    const headerStyle = {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '1rem 0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
    };

    const containerStyle = {
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 2rem',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '2rem'
    };

    const linkStyle = {
        color: 'white',
        textDecoration: 'none',
        fontWeight: 600,
        fontSize: '1.1rem',
        padding: '0.5rem 1rem',
        borderRadius: '8px'
    };

    return (
        <header style={headerStyle}>
            <div style={containerStyle}>
                <Link to="/sandigital" style={linkStyle}>
                    SanDigital
                </Link>

                <Link to="/" style={linkStyle}>
                    PoolChain
                </Link>

                <WalletConnect />
            </div>
        </header>
    );
}
