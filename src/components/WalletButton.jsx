import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { abbreviateAddress } from '../web3/utils'
import './WalletButton.css'

export default function WalletButton() {
    const { address, isConnected } = useAccount()
    const { connect, connectors, isPending } = useConnect()
    const { disconnect } = useDisconnect()

    if (isConnected && address) {
        return (
            <button onClick={() => disconnect()} className="wallet-button connected">
                {abbreviateAddress(address)}
            </button>
        )
    }

    return (
        <button
            onClick={() => connect({ connector: connectors[0] })}
            disabled={isPending}
            className="wallet-button"
        >
            {isPending ? 'Conectando...' : 'Conectar Wallet'}
        </button>
    )
}
