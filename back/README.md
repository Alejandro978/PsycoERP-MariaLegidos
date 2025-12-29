# 💻 Backend del Proyecto

Guía rápida para poner en marcha el backend.

## 🚀 Stack Tecnológico

| Tecnología  | Descripción                           |
| ----------- | ------------------------------------- |
| **Node.js** | Entorno de ejecución de JavaScript.   |
| **Express** | Framework web para crear la API REST. |
| **Nodemon** | Reinicia el servidor automáticamente. |
| **MariaDB** | Base de datos relacional.             |

## 🛠️ Puesta en Marcha

### 1. Requisitos del sistema

Asegúrate de tener instalados los siguientes componentes:

- **Node.js 20.13.1**: [Descarga aquí](https://nodejs.org/download/release/v20.13.1/node-v20.13.1-x64.msi). Verifica la instalación con `node -v`.
- **HeidiSQL (Portable)**: Para gestionar la base de datos. [Descarga aquí](https://www.heidisql.com/downloads/releases/HeidiSQL_12.11_64_Portable.zip).

### 2. Configuración del archivo .env (PASO CRÍTICO):

1. Crea un archivo llamado .env en la raíz del proyecto

2. **IMPORTANTE**: Este archivo contiene credenciales sensibles y nunca debe ser pusheado al repositorio

3. Para obtener las credenciales correctas (host, usuario, contraseña, etc.), contacta directamente con DatabaseMaster

4. El archivo .env debe tener la siguiente estructura:

```
# Configuración de la base de datos
DB_HOST=tu_host_aqui
DB_USER=tu_usuario_aqui
DB_PASSWORD=tu_contraseña_aqui
DB_NAME=nombre_de_la_base_de_datos
DB_PORT=3306

# Puerto del servidor
PORT=3000

# Otras configuraciones (si aplican)
NODE_ENV=development
```

### 3. Configuración del proyecto

1. Abre tu terminal y navega hasta la carpeta del proyecto.

2. Instala las dependencias necesarias:

   ```bash
   npm install
   ```

3. Inicia el servidor en modo de desarrollo:
   ```bash
   nodemon app.js
   ```

## 🚨 Solución de Problemas (Windows)

Si encuentras el error de política de ejecución en PowerShell:

```
nodemon : No se puede cargar el archivo...
```

Esto sucede porque PowerShell tiene la ejecución de scripts deshabilitada. Lanza en Powershell:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
```

Para más detalles, visita [este enlace](https://www.cdmon.com/es/blog/la-ejecucion-de-scripts-esta-deshabilitada-en-este-sistema-te-contamos-como-actuar).

## 📊 Gestión de la Base de Datos con HeidiSQL

Descomprime el archivo de HeidiSQL y ejecuta `heidisql.exe`. Puedes usarlo para conectarte a la base de datos de desarrollo y realizar tareas como inspeccionar tablas, ejecutar consultas y depurar datos.

## 📅 Configuración de Google Calendar / Google Meet

El sistema utiliza Google Calendar API para crear sesiones de Google Meet automáticamente cuando se crean recordatorios. La autenticación se basa en credenciales OAuth2 que varían según el entorno.

### 🔐 Enrutamiento por Hostname

El sistema detecta automáticamente el entorno basándose en el hostname de la petición (similar al patrón usado en `config/db.js`):

- **localhost** → Usa credenciales de **TEST**
- **Hostname contiene "test."** (ej: `test.millopsicologia.com`) → Usa credenciales de **TEST**
- **Cualquier otro hostname** → Usa credenciales de **PRODUCCIÓN**

**Archivos de credenciales esperados:**

```
.secret/
├── credentials.production.json    # Cuenta de clienta (producción)
├── token.production.json
├── credentials.test.json          # Cuenta de desarrollo (test)
└── token.test.json
```

### 🛠️ Generar Credenciales de Test

Para evitar afectar el calendario de producción durante el desarrollo, necesitas crear credenciales de test con tu propia cuenta de Google:

#### Paso 1: Crear Proyecto en Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto (ej: "Psychology-ERP-Test")
3. Habilita **Google Calendar API**:
   - Navega a "APIs & Services" > "Library"
   - Busca "Google Calendar API"
   - Click en "Enable"

#### Paso 2: Configurar OAuth Consent Screen

1. Ve a "APIs & Services" > "OAuth consent screen"
2. Selecciona **External** (o Internal si tu cuenta es de Google Workspace)
3. Completa los campos requeridos:
   - App name: "Psychology ERP Test"
   - User support email: tu email
   - Developer contact: tu email
4. **Agregar scopes**:
   - `https://www.googleapis.com/auth/calendar`
5. **Agregar test users** (si es External):
   - Agrega tu email como test user

#### Paso 3: Crear Credenciales OAuth2

1. Ve a "APIs & Services" > "Credentials"
2. Click en "Create Credentials" > "OAuth client ID"
3. Application type: **Web application**
4. Name: "Psychology ERP Backend Test"
5. **Authorized redirect URIs**:
   - `http://localhost:3000/oauth/callback`
   - `http://test.millopsicologia.com:3000/oauth/callback` (si aplica)
6. Click "Create"
7. **Descarga el JSON** (botón de descarga)

#### Paso 4: Colocar Credenciales

1. Renombra el archivo descargado a `credentials.test.json`
2. Mueve el archivo a la carpeta `.secret/` en la raíz del proyecto:
   ```bash
   mv ~/Downloads/client_secret_*.json .secret/credentials.test.json
   ```

#### Paso 5: Generar Token de Acceso

1. Ejecuta el script de generación de tokens **especificando el entorno**:

   ```bash
   node scripts/get_gcal_token.js test
   ```

   > 💡 **Nota**: El script acepta `test` o `production` como parámetro. Por defecto usa `test`.

2. Se mostrará una URL en la consola
3. Copia y pega la URL en tu navegador
4. Inicia sesión con **tu cuenta de Google** (la que usaste como test user)
5. Acepta los permisos solicitados
6. Copia el código de autorización que aparece
7. Pégalo en la terminal cuando lo solicite
8. El script guardará el token automáticamente en `.secret/token.test.json`

**Para generar el token de producción** (si es necesario):

```bash
node scripts/get_gcal_token.js production
```

### ✅ Verificación

- **Producción**: Las sesiones se crean en el calendar de la clienta
- **Test (localhost/test.\*)**: Las sesiones se crean en tu calendar personal

Para verificar qué credenciales se están usando, revisa los logs del servidor:

```
[GoogleMeet] Inicializando con hostname: localhost
[GoogleMeet] Usando credenciales de TEST
```

### 🔄 Migrar Credenciales Existentes a Producción

Si ya tienes archivos `credentials.json` y `token.json` en `.secret/`, necesitas renombrarlos para que el sistema los reconozca como de producción:

```bash
cd .secret
mv credentials.json credentials.production.json
mv token.json token.production.json
```

### ⚠️ Notas Importantes

- Los archivos en `.secret/` **nunca deben commitearse** al repositorio
- Cada desarrollador debe generar sus propias credenciales de test
- El token de acceso expira cada cierto tiempo; si ves errores de autenticación, regenera el token:
  ```bash
  node scripts/get_gcal_token.js test
  ```
- En producción, el sistema usa las credenciales de la cuenta empresarial de la clienta
