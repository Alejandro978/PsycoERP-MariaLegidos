# 🔐 Instrucciones para Reautorizar Google Calendar

## ⚠️ ¿Cuándo necesitas esto?

Solo cuando veas este error en los logs:

```
invalid_grant: Token has been expired or revoked
```

## 🎯 Solución Rápida (2 minutos)

### **En el VPS (Servidor de Producción):**

```bash
# 1. Conectar al VPS
ssh root@tu-vps-ip

# 2. Ir al directorio del proyecto
cd /ruta/de/tu/proyecto/back

# 3. Regenerar el token
node scripts/get_gcal_token.js production

# 4. Seguir las instrucciones que aparecen en pantalla:
#    - Copiar la URL generada
#    - Abrir en navegador
#    - Iniciar sesión con la cuenta de Google de la psicóloga
#    - Copiar el código de autorización
#    - Pegarlo en la terminal

# 5. Reiniciar la aplicación
pm2 restart millopsicologia-api
```

## 📋 Detalles Técnicos

### **¿Por qué expira el token?**

- **Access Token**: Expira cada ~1 hora → **RENOVACIÓN AUTOMÁTICA** ✅
- **Refresh Token**: Expira si:
  - No se usa por 6 meses consecutivos
  - El usuario revoca el acceso manualmente
  - Cambios de seguridad en la cuenta de Google

### **¿Qué hace el código ahora?**

```javascript
// Configurado listener automático para renovar access_tokens
oAuth2Client.on("tokens", (newTokens) => {
  // Guarda automáticamente el nuevo access_token
  // La psicóloga NO necesita hacer nada
});
```

### **Resultado:**

- ✅ **Access Tokens**: Se renuevan automáticamente cada hora
- ✅ **Refresh Token**: Válido por tiempo indefinido mientras se use regularmente
- ⚠️ **Solo necesitas reautorizar**: Si el refresh_token expira (muy raro si la app se usa semanalmente)

## 🚀 Para Probar Localmente (Entorno Test)

```bash
# Usar el token de test
node scripts/get_gcal_token.js test
```

## 💡 Recomendación

**Este proceso debería ser necesario solo 1-2 veces al año como máximo** si la aplicación se usa regularmente (lo cual renovará automáticamente los access_tokens usando el refresh_token).

Si necesitas hacerlo más frecuentemente, puede indicar:

1. La cuenta de Google tiene configuración de seguridad muy estricta
2. Hay múltiples aplicaciones usando la misma cuenta
3. El usuario está revocando permisos manualmente
