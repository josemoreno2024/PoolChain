# Scripts de Configuración de Wallets

## Archivos Generados

- `generateWallets.js` - Genera 22 wallets (11-32)
- `fundWallets.js` - Financia con ETH y acuña USDT
- `wallets.json` - Almacena addresses y private keys (PRIVADO)

## Uso

### Paso 1: Generar Wallets

```bash
cd contracts
npx hardhat run scripts/generateWallets.js --network sepolia
```

Esto creará `wallets.json` con 22 wallets.

### Paso 2: Financiar Wallets

**IMPORTANTE:** Antes de ejecutar, actualiza la dirección del contrato USDT en `fundWallets.js`:

```javascript
const USDT_ADDRESS = '0xTU_DIRECCION_AQUI';
```

Luego ejecuta:

```bash
npx hardhat run scripts/fundWallets.js --network sepolia
```

Esto:
- Enviará 0.1 ETH a cada wallet (para gas)
- Acuñará 1000 USDT en cada wallet

### Paso 3: Importar en MetaMask

1. Abre `scripts/wallets.json`
2. Para cada wallet, copia la `privateKey`
3. En MetaMask:
   - Click en el icono de cuenta
   - "Importar cuenta"
   - Pega la private key
   - Nombra la cuenta (ej: "Test Wallet 11")

## Seguridad

⚠️ **CRÍTICO:**
- `wallets.json` contiene claves privadas
- NO compartir este archivo
- NO subir a Git (ya está en .gitignore)
- Estas wallets son SOLO para testing

## Verificación

Después de importar, verifica en MetaMask:
- Red: Sepolia
- Balance ETH: ~0.1 ETH
- Balance USDT: 1000 USDT

## Troubleshooting

### Error: "No hay suficiente ETH"
- Consigue más ETH de Sepolia desde un faucet
- https://sepoliafaucet.com/

### Error: "Cannot find module"
- Asegúrate de estar en la carpeta `contracts`
- Ejecuta `npm install` si es necesario

### USDT no aparece en MetaMask
- Agrega el token manualmente:
  - Address: (tu contrato MockUSDT)
  - Symbol: USDT
  - Decimals: 6
