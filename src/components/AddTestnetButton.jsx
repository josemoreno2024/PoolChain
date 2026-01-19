import { useState } from 'react';

export function AddTestnetButton() {
    const [status, setStatus] = useState('idle'); // idle, adding, success, error

    const addOpBNBTestnet = async () => {
        setStatus('adding');

        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                    chainId: '0x15eb', // 5611 in hex
                    chainName: 'opBNB Testnet',
                    nativeCurrency: {
                        name: 'BNB',
                        symbol: 'BNB',
                        decimals: 18
                    },
                    rpcUrls: ['https://opbnb-testnet-rpc.bnbchain.org'],
                    blockExplorerUrls: ['https://testnet.opbnbscan.com']
                }]
            });

            setStatus('success');
            setTimeout(() => setStatus('idle'), 3000);
        } catch (error) {
            console.error('Error adding network:', error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <button
            onClick={addOpBNBTestnet}
            disabled={status === 'adding'}
            className={`add-testnet-btn ${status}`}
            style={{
                position: 'fixed',
                bottom: '20px',
                right: '20px',
                padding: '16px 24px',
                background: status === 'success' ? '#10b981' : status === 'error' ? '#ef4444' : '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: '600',
                cursor: status === 'adding' ? 'wait' : 'pointer',
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.3s ease',
                zIndex: 9999
            }}
        >
            {status === 'idle' && '🧪 Agregar opBNB Testnet'}
            {status === 'adding' && '⏳ Agregando...'}
            {status === 'success' && '✅ ¡Red Agregada!'}
            {status === 'error' && '❌ Error - Intenta manual'}
        </button>
    );
}
