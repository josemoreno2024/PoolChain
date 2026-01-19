# 🔐 Guía de Sellado de Autoría - PoolChain

## Instrucciones para Agregar Copyright a Archivos

Todos los archivos del proyecto PoolChain deben incluir el header de copyright correspondiente al inicio del archivo.

### Headers Disponibles

Los templates están en: `COPYRIGHT_HEADER.js`

1. **Para archivos JavaScript/JSX** → `COPYRIGHT_HEADER_JS`
2. **Para archivos CSS** → `COPYRIGHT_HEADER_CSS`
3. **Para archivos Solidity** → `COPYRIGHT_HEADER_SOL`

### Archivos Principales Ya Sellados

✅ `src/poolchain/components/AuditModal.jsx`  
✅ `contracts/PoolChain.sol`  
✅ `TIMESTAMP_CERTIFICATE.md`  
✅ `COPYRIGHT_NOTICE.md`

### Archivos Pendientes de Sellar

Los siguientes archivos deben incluir el header:

#### Componentes PoolChain
- [ ] `src/poolchain/pages/PoolChainPage.jsx`
- [ ] `src/poolchain/hooks/usePoolChain.js`
- [ ] `src/poolchain/components/PurchaseModal.jsx`
- [ ] `src/poolchain/components/MyTicketsModal.jsx`
- [ ] `src/poolchain/components/CelebrationModal.jsx`
- [ ] `src/poolchain/components/HistoryModal.jsx`
- [ ] `src/poolchain/components/SystemActivityModal.jsx`
- [ ] `src/poolchain/utils/earningsUtils.js`
- [ ] `src/poolchain/utils/historyUtils.js`
- [ ] `src/poolchain/utils/poolActivityUtils.js`

#### Estilos
- [ ] `src/poolchain/components/AuditModal.css`
- [ ] `src/poolchain/pages/PoolChainPage.css`

#### Configuración
- [ ] `src/poolchain/config/deployBlocks.js`

#### Aplicación Principal
- [ ] `src/App.jsx`
- [ ] `src/main.jsx`

### Cómo Agregar el Header

1. **Abrir el archivo** a sellar
2. **Copiar el header** correspondiente de `COPYRIGHT_HEADER.js`
3. **Pegar al inicio** del archivo (después de imports si es necesario)
4. **Guardar** el archivo

### Ejemplo para JavaScript/JSX

```javascript
/**
 * ═══════════════════════════════════════════════════════════════════
 * PoolChain - Sistema de Lotería Descentralizada
 * ═══════════════════════════════════════════════════════════════════
 * 
 * @author SanDigital / Coliriun
 * Copyright © 2026 SanDigital - Todos los derechos reservados
 * 
 * Protegido por sello de tiempo eIDAS (Serie: 58485363)
 * Hash: dd9d06efabd7271ae12576ee18803616c40464b1f8f9d24769232f23b7312292
 * Verificación: https://cipsc.coloriuris.net/tsa/
 * 
 * Licencia MIT (uso comercial restringido) | contacto@sandigital.com
 * ═══════════════════════════════════════════════════════════════════
 */

import React from 'react';
// ... resto del código
```

### Verificación

Después de agregar los headers:

1. ✅ Verificar que el header esté al inicio
2. ✅ Verificar que el hash coincida: `dd9d06efabd7271ae12576ee18803616c40464b1f8f9d24769232f23b7312292`
3. ✅ Verificar que el número de serie sea: `58485363`
4. ✅ Commit a Git con mensaje: "chore: Add copyright headers to all files"

### Commit a GitHub

Una vez todos los archivos estén sellados:

```bash
git add .
git commit -m "chore: Add copyright headers and timestamp certificate"
git push origin main
```

### Repositorio

**GitHub:** https://github.com/josemoreno2024/PoolChain.git  
**Clone:** `gh repo clone josemoreno2024/PoolChain`

---

**Última actualización:** 2026-01-19  
**Estado:** En progreso (2/50 archivos sellados)
