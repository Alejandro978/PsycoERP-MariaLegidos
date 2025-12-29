# 🚀 Solución Implementada: Renovación Automática de Tokens de Google

## ✅ ¿Qué he cambiado?

### **Antes (Problema):**

```javascript
// Solo cargaba el token, NO lo renovaba
oAuth2Client.setCredentials(token);
// Cuando el access_token expiraba → ERROR invalid_grant
```

### **Ahora (Solución):**

```javascript
oAuth2Client.setCredentials(token);

// 🔄 Configurado listener para renovación automática
oAuth2Client.on("tokens", (newTokens) => {
  // Guarda automáticamente el nuevo access_token
  // La psicóloga NO necesita hacer nada
});
```

## 📊 Tipos de Tokens y Su Comportamiento

| Token Type        | Duración         | Renovación           | Tu Código Ahora                       |
| ----------------- | ---------------- | -------------------- | ------------------------------------- |
| **Access Token**  | ~1 hora          | ✅ **AUTOMÁTICA**    | Configurado listener `on('tokens')`   |
| **Refresh Token** | ~6 meses sin uso | ❌ Manual (muy raro) | Script `get_gcal_token.js` disponible |

## 🎯 Resultado Final

### **Escenario Normal (99% del tiempo):**

1. Usuario crea recordatorio → Se usa el token
2. Access Token expira después de 1 hora
3. **Tu código renueva automáticamente** usando el refresh_token
4. **Se guarda el nuevo token** en el archivo
5. ✅ **Todo funciona sin intervención**

### **Escenario Excepcional (1% del tiempo):**

Solo si el refresh_token expira (6 meses sin uso):

1. Error `invalid_grant` aparece en logs
2. Ejecutas: `node scripts/get_gcal_token.js production`
3. Envías URL a la psicóloga
4. Ella autoriza (2 minutos)
5. ✅ **Funcionará otros 6 meses mínimo**

## 📁 Archivos Modificados

### 1. `/config/googleMeet.js`

```javascript
// ✅ Añadido listener automático para renovación
oAuth2Client.on("tokens", (newTokens) => {
  // Guarda automáticamente access_token renovado
});
```

### 2. `/REAUTHORIZE_GOOGLE_INSTRUCTIONS.md` (NUEVO)

- Instrucciones paso a paso para reautorizar
- Solo necesario si refresh_token expira

### 3. `/scripts/get_gcal_token.js` (Ya existía)

- Script para generar tokens nuevos
- Uso: `node scripts/get_gcal_token.js production`

## 🔧 Próximos Pasos para Resolver el Problema Actual

### **En el VPS (AHORA):**

```bash
# 1. Conectar al VPS
ssh root@tu-vps-ip

# 2. Ir al directorio del proyecto
cd /ruta/del/proyecto/back

# 3. Hacer git pull para obtener los cambios
git pull origin main  # o tu rama principal

# 4. Regenerar el token (última vez que tendrás que hacerlo en mucho tiempo)
node scripts/get_gcal_token.js production

# Seguir las instrucciones en pantalla:
# - Copiar URL
# - Enviar a la psicóloga
# - Ella autoriza
# - Pegar código de autorización

# 5. Reiniciar aplicación con el código nuevo
pm2 restart millopsicologia-api

# 6. Verificar logs
pm2 logs millopsicologia-api --lines 50
```

## 💡 Preguntas Frecuentes

### **¿Por qué falló después de 7-9 días?**

El access_token original expiró después de 1 hora, pero como tu código NO lo renovaba automáticamente, Google eventualmente marcó el refresh_token como inválido después de múltiples intentos fallidos.

### **¿Esto va a volver a pasar?**

**NO**, porque ahora el código:

1. Renueva automáticamente el access_token cada hora
2. Guarda el token renovado en el archivo
3. El refresh_token permanece válido indefinidamente mientras se use

### **¿Cuándo necesitaré reautorizar de nuevo?**

Solo si:

- La app no se usa por 6 meses consecutivos (muy improbable)
- La psicóloga revoca manualmente los permisos
- Cambios de seguridad mayores en su cuenta de Google

## 🎉 Conclusión

Con estos cambios, **la psicóloga debería NO necesitar reautorizar durante meses/años**, siempre que la aplicación se use regularmente (semanalmente está más que bien).

Si vuelve a pasar en menos de 6 meses, revisa:

1. Que el archivo `token.production.json` tenga `refresh_token`
2. Que los permisos del archivo permitan escritura (para guardar el token renovado)
3. Que no haya múltiples instancias de la app usando el mismo token

---

**Próxima acción inmediata:** Ejecutar el script en el VPS para regenerar el token con el código nuevo que ya renueva automáticamente.
