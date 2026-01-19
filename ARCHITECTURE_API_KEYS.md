# 🔐 Recomendación de Arquitectura: API Keys en Frontend

## ⚠️ PROBLEMA ACTUAL

El archivo `src/sandigital/config/alchemy.js` usa:
```javascript
apiKey: process.env.REACT_APP_ALCHEMY_API_KEY_MICRO
```

**Esto significa que las API keys van al bundle de producción del frontend.**

---

## 🚨 RIESGO

Aunque las API keys de Alchemy son "read-only", **NUNCA deben ir al frontend** porque:

1. **Cualquiera puede extraerlas** del bundle JavaScript
2. **Pueden agotar tu cuota** de requests
3. **No puedes revocarlas** sin redesplegar
4. **Mala práctica** de seguridad Web3

---

## ✅ SOLUCIÓN RECOMENDADA

### Arquitectura Correcta: Backend Proxy

```
Frontend → Backend/Serverless → Alchemy
```

### Opción 1: Serverless Function (Vercel/Netlify)

**Crear:** `api/rpc.js`
```javascript
export default async function handler(req, res) {
  const { tier, method, params } = req.body;
  
  // Las keys viven SOLO en el servidor
  const ALCHEMY_KEYS = {
    micro: process.env.ALCHEMY_API_KEY_MICRO,
    standard: process.env.ALCHEMY_API_KEY_STANDARD,
    // ...
  };
  
  const response = await fetch(
    `https://opbnb-testnet.g.alchemy.com/v2/${ALCHEMY_KEYS[tier]}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 })
    }
  );
  
  const data = await response.json();
  res.json(data);
}
```

**Frontend:** `src/sandigital/config/alchemy.js`
```javascript
export const getAlchemyRpcUrl = (tierId) => {
  // En producción, apunta a tu proxy
  if (import.meta.env.PROD) {
    return '/api/rpc'; // Tu serverless function
  }
  
  // En desarrollo, usa las keys locales
  return `https://opbnb-testnet.g.alchemy.com/v2/${process.env.REACT_APP_ALCHEMY_API_KEY_MICRO}`;
};
```

### Opción 2: Backend Express/Node

**Crear:** `backend/server.js`
```javascript
const express = require('express');
const app = express();

app.post('/api/rpc', async (req, res) => {
  const { tier, method, params } = req.body;
  
  const ALCHEMY_KEYS = {
    micro: process.env.ALCHEMY_API_KEY_MICRO,
    // Keys del sistema, NO del frontend
  };
  
  // Proxy request a Alchemy
  const response = await fetch(
    `https://opbnb-testnet.g.alchemy.com/v2/${ALCHEMY_KEYS[tier]}`,
    {
      method: 'POST',
      body: JSON.stringify({ jsonrpc: '2.0', method, params, id: 1 })
    }
  );
  
  res.json(await response.json());
});

app.listen(3001);
```

---

## 📋 PLAN DE MIGRACIÓN

### Fase 1: Desarrollo (Actual) ✅
- Frontend usa `REACT_APP_ALCHEMY_API_KEY_*`
- Solo para testing local
- **NUNCA** desplegar a producción así

### Fase 2: Producción (Recomendado) 🎯
1. Crear serverless function o backend
2. Mover keys al servidor
3. Frontend llama a `/api/rpc`
4. Eliminar `REACT_APP_ALCHEMY_API_KEY_*` del `.env` de producción

---

## 🛡️ PROTECCIÓN ADICIONAL

### En `.env.example`

Agregar advertencia:
```bash
# ⚠️ SOLO PARA DESARROLLO LOCAL
# EN PRODUCCIÓN: Usar backend proxy
REACT_APP_ALCHEMY_API_KEY_MICRO=your_key_here
```

### En `alchemy.js`

Agregar validación:
```javascript
if (import.meta.env.PROD && process.env.REACT_APP_ALCHEMY_API_KEY_MICRO) {
  console.error('❌ SECURITY WARNING: API keys detected in production frontend!');
  throw new Error('Use backend proxy for production');
}
```

---

## ✅ ESTADO ACTUAL vs RECOMENDADO

| Aspecto | Actual | Recomendado |
|---------|--------|-------------|
| **Desarrollo** | ✅ Keys en `.env` local | ✅ Keys en `.env` local |
| **Producción** | ❌ Keys en bundle | ✅ Keys en backend |
| **Seguridad** | ⚠️ Media | ✅ Alta |
| **Escalabilidad** | ⚠️ Limitada | ✅ Completa |

---

## 🎯 PRÓXIMOS PASOS

### Inmediato (Desarrollo)
- ✅ Mantener configuración actual para testing
- ✅ Documentar que es solo para desarrollo

### Antes de Producción
- [ ] Implementar backend proxy (Vercel Functions recomendado)
- [ ] Mover keys al servidor
- [ ] Eliminar `REACT_APP_ALCHEMY_API_KEY_*` de producción
- [ ] Probar con proxy

---

## 📝 CONCLUSIÓN

**Para desarrollo:** La configuración actual es ACEPTABLE.

**Para producción:** DEBE implementarse un backend proxy.

**Riesgo actual:** BAJO (solo si no se despliega a producción con keys en frontend)

**Prioridad:** MEDIA (antes del primer deploy a producción)

---

**Documento creado:** 2026-01-19  
**Autor:** Antigravity AI  
**Estado:** Recomendación técnica
