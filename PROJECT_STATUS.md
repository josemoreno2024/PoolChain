# SanDigital2026 - Estado del Proyecto

**Última Actualización:** 2026-01-02  
**Versión del Contrato:** v3.0 (FIFO + Manual Claim)  
**Estado:** En Refactorización

---

## 📋 Información Actual

### Contratos Desplegados (Sepolia Testnet)
- **MockUSDT:** `0xB35b75a2392659701600a6e816C5DB00f09Ed6C7`
- **SanDigital2026:** `0x0EEF5018d3074279d67f215AF2EF33D600CEF558` (FIFO - Pendiente Refactorización)

### Parámetros del Sistema
- **Entrada:** 20 USDT
- **Salida:** 40 USDT (automática al alcanzar threshold)
- **Distribución:** 10 USDT Turno + 9 USDT Global + 1 USDT Fee
- **Cola:** FIFO (First-In, First-Out)
- **Límite:** 10 posiciones por usuario

---

## ✅ Fixes Implementados

### Críticos (Completados)
1. ✅ **Underflow Protection** - `_getPendingGlobal()` y `_removerDeActivos()`
2. ✅ **Precision Fix** - `rewardDebt` normalizado con 1e12
3. ✅ **FIFO Queue** - Turno siempre va a `activos[0]`
4. ✅ **Array Shifting** - Mantiene orden de cola
5. ✅ **UI Turno Display** - Muestra Position ID real, no índice

### En Progreso
- 🔄 **Eliminar Auto-Pago** - Usuario debe hacer claim manual
- 🔄 **Pending Withdrawals** - Protección si transferencia falla
- 🔄 **UI Clarity** - Mensajes claros en posiciones completadas

---

## 🚨 Problemas Identificados (A Resolver)

### 1. Auto-Pago Problemático
**Problema:** Cuando Usuario A llega a 40 USDT, el contrato automáticamente le transfiere los fondos cuando Usuario B entra.
**Consecuencia:** Usuario B paga el gas de la transferencia de Usuario A.

**Solución Propuesta:**
```solidity
// ANTES (Línea 325)
token.safeTransfer(p.owner, totalBalance); // ❌ Auto-pago

// DESPUÉS
// Solo marcar como completado, NO pagar
p.hasExited = true;
p.saldoTurno = totalBalance; // Guardar para claim manual
```

### 2. Botón Claim Desaparece
**Problema:** UI oculta botón cuando `isActive = false`
**Solución:** Mostrar botón si `hasExited = true && balance > 0`

### 3. Sin Protección de Fondos
**Problema:** Si `transfer()` falla, fondos se pierden
**Solución:** Agregar `pendingWithdrawals` mapping

---

## 📊 Arquitectura Recomendada

### Comparación con Matriz5xNCore (Producción)
| Feature | Matriz5xN | SanDigital Actual | Recomendado |
|---------|-----------|-------------------|-------------|
| Líneas | ~600 | 491 | 540-640 |
| Auto-Pago | ❌ | ✅ (bug) | ❌ |
| Pending Withdrawals | ✅ | ❌ | ✅ |
| Timelock | ✅ (1 día) | ❌ | ✅ (2 días) |
| Emergency Pause | ✅ | ✅ | ✅ |
| Blacklist | ✅ | ❌ | ⚠️ (Opcional) |

### Decisión: Monolítico Mejorado
**NO dividir en múltiples contratos aún.**

**Razones:**
- Más simple de auditar
- Menos gas en transacciones
- Suficiente para MVP y producción inicial
- Modularizar solo si supera 1000 líneas

---

## 🎯 Plan de Implementación

### Fase 1: Refactorización Crítica (HOY)
- [ ] Eliminar auto-pago de `_verificarSalida()`
- [ ] Agregar `mapping(address => uint256) public pendingWithdrawals`
- [ ] Modificar `claim()` para permitir claim de posiciones completadas
- [ ] Actualizar UI para mostrar botón en posiciones completadas
- [ ] Desplegar y probar

### Fase 2: Hardening (Esta Semana)
- [ ] Implementar Timelock (2 días) para cambios críticos
- [ ] Agregar funciones `queueOperation()` y `cancelOperation()`
- [ ] Emergency Pause mejorado
- [ ] Testing exhaustivo

### Fase 3: Producción (Próxima Semana)
- [ ] Auditoría profesional
- [ ] Despliegue a mainnet (decidir red: Polygon, BSC, Ethereum)
- [ ] Documentación final
- [ ] Marketing

---

## 📁 Archivos Clave

### Contratos
- `contracts/SanDigital2026.sol` - Contrato principal (491 líneas)
- `contracts/MockUSDT.sol` - Token de prueba

### Scripts Activos
- `scripts/deploy_linked_to_user_token.js` - Despliegue con MockUSDT específico
- `scripts/deploy_and_save.js` - Despliegue y guardado de dirección
- `scripts/verify_ui_state.js` - Verificación de estado on-chain

### Frontend
- `src/components/Dashboard.jsx` - Panel principal
- `src/components/PositionCard.jsx` - Tarjeta de posición
- `src/web3/hooks/useSanDigital.js` - Hook principal
- `src/contracts/addresses.json` - Direcciones de contratos

---

## 🔧 Comandos Útiles

### Desarrollo
```bash
npm run dev                    # Iniciar frontend
npx hardhat compile            # Compilar contratos
npx hardhat run scripts/verify_ui_state.js --network sepolia  # Verificar estado
```

### Despliegue
```bash
npx hardhat run scripts/deploy_linked_to_user_token.js --network sepolia
```

### Limpieza
```bash
rm -rf node_modules/.vite      # Limpiar caché de Vite
```

---

## 📝 Notas de Desarrollo

### Archivos Eliminados (Obsoletos)
- ❌ `audit_result.txt`
- ❌ `audit_result_v3.txt`
- ❌ `verification_output.txt`
- ❌ `scripts/audit_distribution*.js` (v1, v2, v3)
- ❌ `scripts/check-*.js` (7 archivos)

### Decisiones de Diseño
1. **FIFO Estricto:** Turno siempre va al primero de la cola
2. **Exit Threshold:** 40 USDT (2x inversión)
3. **Claim Manual:** Usuario controla cuándo cobra (paga su gas)
4. **Infinite Approval:** Estándar DeFi para UX fluida

---

## 🚀 Próximos Pasos

1. **Implementar refactorización** (eliminar auto-pago)
2. **Testing completo** con 10+ posiciones
3. **Verificar en móvil** (responsive design)
4. **Preparar para mainnet**

---

**Mantenido por:** Sistema Editor Avanzado AI  
**Última Revisión:** 2026-01-02 23:50 CET
