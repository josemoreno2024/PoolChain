# Guía de Prueba - Sistema Real con Blockchain

## 🚀 PASOS PARA PROBAR LA APP

### **PASO 1: Iniciar Hardhat Network**

Abre una terminal WSL:
```bash
cd /mnt/c/Users/jose0/SanDigital2026/SanDigital2026/contracts
npx hardhat node
```

**Deberías ver:**
```
Started HTTP and WebSocket JSON-RPC server at http://127.0.0.1:8545/

Accounts
========
Account #0: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266 (10000 ETH)
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
...
```

**⚠️ Deja esta terminal abierta** (no la cierres)

---

### **PASO 2: Desplegar Contratos**

Abre una **NUEVA terminal WSL**:
```bash
cd /mnt/c/Users/jose0/SanDigital2026/SanDigital2026/contracts
npx hardhat run scripts/deploy-local.js --network localhost
```

**Deberías ver:**
```
🚀 Desplegando SanDigital2026 en red local...
✅ MockUSDT desplegado en: 0x5FbDB2315678afecb367f032d93F642f64180aa3
✅ SanDigital2026 desplegado en: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

**Copia estas direcciones** (las necesitarás para MetaMask)

---

### **PASO 3: Iniciar Frontend**

Abre una **NUEVA terminal WSL**:
```bash
cd /mnt/c/Users/jose0/SanDigital2026/SanDigital2026
npm run dev
```

**Deberías ver:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

---

### **PASO 4: Configurar MetaMask**

#### **4.1. Añadir Red Local**
1. Abre MetaMask
2. Click en el selector de red (arriba)
3. "Añadir red" → "Añadir red manualmente"
4. Configura:
   - **Nombre:** Hardhat Local
   - **RPC URL:** `http://127.0.0.1:8545`
   - **Chain ID:** `31337`
   - **Símbolo:** ETH
5. Click "Guardar"

#### **4.2. Importar Cuenta de Prueba**
1. MetaMask → Click en icono de cuenta
2. "Importar cuenta"
3. Pega la private key de Account #0:
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. Click "Importar"

**Deberías ver:** 10,000 ETH en tu balance

#### **4.3. Añadir Token USDT**
1. MetaMask → "Importar tokens"
2. Pega la dirección de MockUSDT (del PASO 2)
3. Debería autocompletar:
   - Símbolo: USDT
   - Decimales: 6
4. Click "Añadir"

**Deberías ver:** 1,000 USDT en tu balance

---

### **PASO 5: Probar la App**

#### **5.1. Conectar Wallet**
1. Abre `http://localhost:5173`
2. Click "Conectar Wallet"
3. MetaMask se abrirá
4. Selecciona la cuenta importada
5. Click "Conectar"

#### **5.2. Firmar Términos**
1. Lee los términos
2. Click "Firmar y Aceptar"
3. MetaMask pedirá firma (sin coste)
4. Click "Firmar"

#### **5.3. Ver Dashboard**
Deberías ver:
- Balance USDT: 1,000.00 USDT
- Estado: No participante
- Saldo acumulado: 0.00 USDT
- Botón: "1. Aprobar USDT"

#### **5.4. Aprobar USDT**
1. Click "1. Aprobar USDT"
2. MetaMask pedirá confirmación
3. Click "Confirmar"
4. Espera confirmación (~2 segundos)

**Deberías ver:** Botón cambia a "2. Entrar al SAN (20 USDT)"

#### **5.5. Entrar al SAN**
1. Click "2. Entrar al SAN (20 USDT)"
2. MetaMask pedirá confirmación
3. Click "Confirmar"
4. Espera confirmación

**Deberías ver:**
- Balance USDT: 980.00 USDT (1000 - 20)
- Estado: Activo
- Saldo acumulado: 18.00 USDT (10 turno + 8 global)
- Posición: #1
- Turno actual: Participante #1

#### **5.6. Hacer Claim**
1. Click "Claim (18.00 USDT)"
2. MetaMask pedirá confirmación
3. Click "Confirmar"
4. Espera confirmación

**Deberías ver:**
- Balance USDT: 998.00 USDT (980 + 18)
- Saldo acumulado: 0.00 USDT

---

### **PASO 6: Probar con Múltiples Usuarios**

#### **6.1. Importar otra cuenta**
1. Importa Account #1 en MetaMask:
   ```
   Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ```

#### **6.2. Cambiar de cuenta**
1. Click en el icono de cuenta en MetaMask
2. Selecciona Account #1

#### **6.3. Repetir proceso**
1. Recarga la página
2. Conectar wallet
3. Firmar términos
4. Aprobar USDT
5. Entrar al SAN

**Observa:**
- Account #0 (primer usuario) recibe más saldo
- Account #1 recibe su parte del global
- Turno sigue en Account #0

---

## ✅ VERIFICACIÓN

**En la terminal de Hardhat deberías ver:**
```
eth_sendTransaction
  Contract call:       MockERC20#approve
  From:                0xf39f...
  To:                  0x5FbD...

eth_sendTransaction
  Contract call:       SanDigital2026#join
  From:                0xf39f...
  To:                  0xe7f1...
```

---

## 🎯 QUÉ OBSERVAR

1. **Transacciones reales** con gas
2. **Saldos actualizados** en blockchain
3. **Eventos emitidos** en Hardhat
4. **MetaMask** muestra todas las transacciones
5. **Datos persistentes** (no se pierden al recargar)

---

## 🐛 TROUBLESHOOTING

**Error: "Nonce too high"**
- Solución: MetaMask → Configuración → Avanzado → Borrar datos de actividad

**Error: "Insufficient funds"**
- Solución: Asegúrate de tener ETH para gas (Account #0 tiene 10,000 ETH)

**Error: "Contract not found"**
- Solución: Verifica que Hardhat Network esté corriendo

**Transacción no se confirma**
- Solución: Espera unos segundos, Hardhat mina automáticamente

---

**¡Listo para probar!** 🚀
