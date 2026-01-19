# PoolChain - Sistema de Sorteo Autónomo

## Contratos

- **PoolChain_Hybrid_Auto.sol** - Contrato principal de sorteo con selección de posiciones y sorteo 100% automático
- **MockUSDT.sol** - Token USDT de prueba para BSC Testnet

## Scripts

- **deploy_hybrid_bsc.js** - Despliega el contrato principal en BSC Testnet
- **mint_musdt.js** - Mintea USDT de prueba a una wallet

## Configuración Actual (BSC Testnet)

### Contratos Desplegados
- **PoolChain Hybrid:** `0x20C8d9689708d7d788f361d60D101397cec49fC7`
- **MockUSDT:** `0x7885Ab2E39eAAA6005364f7688E2B75FEC35Aa39`

### Chainlink VRF v2.5
- **VRF Coordinator:** `0xDA3b641D438362C440Ac5458c57e00a712b66700`
- **Key Hash:** `0xcaf3c3727e033261d383b315559476f48034c13b18f8cafed4d871abe5049186` ✅ CORRECTED
- **Subscription ID:** `39265163140503036121577150381371014086785907122241201633055517765001554695711`
- **Versión:** 2.5
- **Balance:** 30 LINK
- **Consumidores:** 2 (incluyendo este contrato)

### Parámetros del Sistema
- **Precio por ticket:** 2 USDT
- **Capacidad del pool:** 100 tickets
- **Máximo por compra:** 10 tickets
- **Máximo por usuario/ronda:** 20 tickets
- **Fee de gas:** 3%
- **Sorteo:** 100% automático al completar 100 tickets

## Características

✅ **Selección de Posiciones:** Usuarios eligen posiciones específicas (1-100)  
✅ **Sorteo Automático:** Se ejecuta automáticamente cuando el pool se llena  
✅ **VRF Integration:** Chainlink VRF v2.5 para números aleatorios verificables  
✅ **Anti-bot:** Límite de 1 compra por bloque por usuario  
✅ **4 Grupos de Premios:** Distribución automática entre 100 ganadores

## Uso

### Desplegar contrato
```bash
npx hardhat run scripts/deploy_hybrid_bsc.js --network bscTestnet
```

### Mintear USDT de prueba
```bash
npx hardhat run scripts/mint_musdt.js --network bscTestnet
```

### Verificar contrato en BSCScan
```bash
npx hardhat verify --network bscTestnet 0x4ce3eAa11e1a0aa5B28d57dB75bfd49b6897539d
```

## Enlaces Útiles

- **VRF Subscription:** https://vrf.chain.link
- **BSCScan Testnet:** https://testnet.bscscan.com/address/0x4ce3eAa11e1a0aa5B28d57dB75bfd49b6897539d
- **Chainlink Docs:** https://docs.chain.link/vrf/v2-5/overview
