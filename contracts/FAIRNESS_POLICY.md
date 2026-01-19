# PoolChain Micro - Políticas de Fairness y Reglas del Sorteo

## 📋 Reglas del Sistema

### **Límites de Participación**
- ✅ **1-10 tickets por compra** - Evita acaparamiento instantáneo
- ✅ **Máximo 20 tickets por usuario por ronda** - Mantiene el sorteo justo
- ✅ **1 compra por bloque** - Anti-bot (bloques opBNB ~1 segundo)
- ✅ **100 participantes máximo** - Pool completo

### **Múltiples Premios**
⚠️ **IMPORTANTE:** Un usuario puede ganar múltiples veces en la misma ronda.

**Ejemplo:**
- Usuario compra 10 tickets (IDs: 5, 12, 23, 34, 45, 56, 67, 78, 89, 90)
- Sorteo selecciona:
  - ID 23 → Grupo A (5.82 USDT)
  - ID 67 → Grupo B (2.91 USDT)
  - ID 89 → Grupo D (0.97 USDT)
- **Total ganado:** 9.70 USDT

**Justificación:**
- Cada ticket es una participación independiente
- Sistema 100% justo (cada ID tiene misma probabilidad)
- Transparente y verificable en blockchain

### **Sorteo Aleatorio**
⚠️ **TESTNET:** Pseudo-random (block.timestamp, block.prevrandao)
✅ **MAINNET:** Chainlink VRF obligatorio

### **Distribución de Premios**
- **Grupo A:** 10 ganadores - 5.82 USDT c/u (30% del pool neto)
- **Grupo B:** 20 ganadores - 2.91 USDT c/u (30% del pool neto)
- **Grupo C:** 30 ganadores - 1.29 USDT c/u (20% del pool neto)
- **Grupo D:** 40 ganadores - 0.97 USDT c/u (20% del pool neto)
- **Gas Fee:** 3% (6 USDT por ronda)

### **Transparencia**
- ✅ Todos los tickets visibles en blockchain
- ✅ Cada compra emite evento con ID único
- ✅ Sorteo verificable en opBNBScan
- ✅ Claims verificables en blockchain

---

## 🔐 Seguridad

### **Protecciones Implementadas**
1. **ReentrancyGuard** - Previene ataques de reentrancy
2. **SafeERC20** - Transferencias seguras
3. **Pausable** - Pausar en emergencia
4. **Emergency Withdraw** - Solo pre-sorteo
5. **Anti-bot** - 1 compra por bloque

### **Auditoría**
- Código open source
- Verificado en opBNBScan
- Eventos para cada acción
- Matemática determinística

---

## ⚖️ Consideraciones Legales

**Descargo de Responsabilidad:**
- Sistema de sorteo con fines de entretenimiento
- Participación voluntaria bajo responsabilidad propia
- No es inversión ni garantía de ganancias
- Fee del 3% para mantenimiento y desarrollo
- Solo para mayores de edad según jurisdicción local

---

## 📊 Estadísticas

**Probabilidades:**
- Grupo A: 10% (10/100)
- Grupo B: 20% (20/100)
- Grupo C: 30% (30/100)
- Grupo D: 40% (40/100)
- **Total ganadores: 100%** (todos ganan algo)

**ROI Esperado:**
- Grupo A: +191% (5.82 USDT de 2 USDT)
- Grupo B: +46% (2.91 USDT de 2 USDT)
- Grupo C: -36% (1.29 USDT de 2 USDT)
- Grupo D: -52% (0.97 USDT de 2 USDT)
- **Promedio ponderado: -3%** (gas fee)

---

**Versión del Contrato:** PoolChain_Micro_MultiTicket v1.0  
**Red:** opBNB Testnet  
**Última actualización:** 12 Enero 2026
