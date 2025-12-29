# 📘 Guía de Configuración VPS Contabo
## Millopsicología - De cero a producción

---

## 1️⃣ Acceso inicial al VPS

### Conectar por SSH

**Datos necesarios (enviados por Contabo):**
- IP del servidor
- Usuario: `root`
- Contraseña

**Conexión:**
```bash
ssh root@62.169.18.15
```

### Primeros pasos de seguridad

```bash
# Actualizar el sistema
apt update && apt upgrade -y

# Cambiar contraseña de root
passwd
```

---

## 2️⃣ Instalación de software esencial

### Node.js 20.13.1

```bash
# Instalar NVM para gestionar versiones de Node
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc

# Instalar Node.js versión específica
nvm install 20.13.1
nvm use 20.13.1
nvm alias default 20.13.1

# Verificar
node -v
npm -v
```

### Angular CLI 17.3.7

```bash
npm install -g @angular/cli@17.3.7
```

### Nginx (servidor web)

```bash
apt install -y nginx
systemctl enable nginx
systemctl start nginx
```

### Certbot (para SSL)

```bash
apt install -y certbot python3-certbot-nginx
```

### PM2 (gestor de procesos Node.js)

```bash
npm install -g pm2
pm2 startup
```

### Herramientas adicionales

```bash
apt install -y git htop curl wget unzip vim nano ufw
```

---

## 3️⃣ Configuración del Firewall

```bash
# Configurar UFW (Uncomplicated Firewall)
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable
ufw status
```

---

## 4️⃣ Configuración DNS

### En DonDominio (panel del dominio)

Añadir registros DNS tipo A:
- `millopsicologia.com` → `62.169.18.15`
- `www.millopsicologia.com` → `62.169.18.15`
- `test.millopsicologia.com` → `62.169.18.15`

### En Contabo (panel VPS)

Ir a "DNS Zone Management" y verificar que los registros A estén correctamente configurados apuntando a la IP del VPS.

**Tiempo de propagación:** 5-30 minutos (puede llegar hasta 24h)

**Verificar propagación:**
```bash
ping millopsicologia.com
ping www.millopsicologia.com
ping test.millopsicologia.com
```

---

## 5️⃣ Estructura de directorios

```bash
# Crear estructura organizada
mkdir -p /var/www/millopsicologia/frontend
mkdir -p /var/www/millopsicologia/frontend-test
mkdir -p /var/www/millopsicologia/backend

# Asignar permisos
chown -R www-data:www-data /var/www/millopsicologia
chmod -R 755 /var/www/millopsicologia
```

---

## 6️⃣ Configuración de Nginx

### Archivo de configuración

```bash
nano /etc/nginx/sites-available/default
```

### Contenido (dos entornos):

```nginx
# PRODUCCIÓN
server {
    listen 80;
    server_name millopsicologia.com www.millopsicologia.com;

    access_log /var/log/nginx/millopsicologia_prod_access.log;
    error_log /var/log/nginx/millopsicologia_prod_error.log;

    location / {
        root /var/www/millopsicologia/frontend;
        index index.html;
        try_files $uri $uri/ /index.html;
        
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}

# TEST
server {
    listen 80;
    server_name test.millopsicologia.com;

    access_log /var/log/nginx/millopsicologia_test_access.log;
    error_log /var/log/nginx/millopsicologia_test_error.log;

    location / {
        root /var/www/millopsicologia/frontend-test;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;
}
```

### Verificar y reiniciar

```bash
nginx -t
systemctl reload nginx
```

---

## 7️⃣ Instalación de certificados SSL

### Para producción

```bash
certbot --nginx -d millopsicologia.com -d www.millopsicologia.com
```

### Para test

```bash
certbot --nginx -d test.millopsicologia.com
```

**Configuración recomendada:**
- Introduce tu email
- Acepta términos
- Elige opción **"2"** para redirigir HTTP a HTTPS automáticamente

### Renovación automática

Certbot configura automáticamente la renovación. Verificar:

```bash
certbot renew --dry-run
systemctl enable certbot.timer
```

Los certificados se renuevan automáticamente cada 90 días.

---

## 8️⃣ Resumen de entornos

### 🟢 PRODUCCIÓN
- **URL:** https://millopsicologia.com / https://www.millopsicologia.com
- **Frontend:** `/var/www/millopsicologia/frontend`
- **Backend:** `localhost:3000` (API única compartida)
- **Uso:** Versión pública estable

### 🟡 TEST
- **URL:** https://test.millopsicologia.com
- **Frontend:** `/var/www/millopsicologia/frontend-test`
- **Backend:** `localhost:3000` (misma API que producción)
- **Uso:** Pruebas antes de pasar a producción

---

## 9️⃣ Configuración de bases de datos

### Instalar MariaDB

```bash
apt install -y mariadb-server mariadb-client
systemctl start mariadb
systemctl enable mariadb
mysql_secure_installation
```

### Crear bases de datos para cada entorno

```bash
mysql -u root -p
```

```sql
-- Crear bases de datos
CREATE DATABASE millopsicologia_prod CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE millopsicologia_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuarios
CREATE USER 'millo_prod'@'localhost' IDENTIFIED BY 'password_seguro_prod';
CREATE USER 'millo_test'@'localhost' IDENTIFIED BY 'password_seguro_test';

-- Dar permisos
GRANT ALL PRIVILEGES ON millopsicologia_prod.* TO 'millo_prod'@'localhost';
GRANT ALL PRIVILEGES ON millopsicologia_test.* TO 'millo_test'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

---

## 🔟 Configuración del Backend

### Clonar repositorio

```bash
cd /var/www/millopsicologia/backend

# Borrar contenido si existe
rm -rf *

# Clonar repositorio completo
git clone https://github.com/dguerrem/PsychologyERP-demo.git .

# Sincronizar contenido de back/ a la raíz
cp -rf back/* .
rm -rf back/ front/

# Instalar dependencias
npm install --production
```

### Copiar carpeta .secret

Desde tu PC local, copia la carpeta .secret necesaria para la API:

```bash
scp -r .secret root@62.169.18.15:/var/www/millopsicologia/backend/
```

### Configurar variables de entorno

```bash
nano /var/www/millopsicologia/backend/.env
```

```env
NODE_ENV=production
PORT=3000

DB_PROD_HOST=localhost
DB_PROD_USER=millo_prod
DB_PROD_PASSWORD=password_seguro_prod
DB_PROD_NAME=millopsicologia_prod

DB_TEST_HOST=localhost
DB_TEST_USER=millo_test
DB_TEST_PASSWORD=password_seguro_test
DB_TEST_NAME=millopsicologia_test

JWT_SECRET=tu_secreto_jwt_aqui
```

### Configurar permisos de Git

```bash
git config --global --add safe.directory /var/www/millopsicologia/backend
```

### Iniciar API con PM2

```bash
pm2 start app.js --name "millopsicologia-api"
pm2 logs millopsicologia-api
pm2 save
```

### Script de actualización del backend

```bash
nano /var/www/millopsicologia/backend/deploy.sh
```

```bash
#!/bin/bash
echo "🚀 Actualizando backend..."

cd /var/www/millopsicologia/backend

# Backup del .env
cp .env /tmp/.env.backup 2>/dev/null

# Pull del repositorio
git pull origin main

# Sincronizar archivos desde back/
if [ -d "back" ]; then
    echo "📦 Sincronizando archivos..."
    cp -rf back/* .
    rm -rf back/ front/
fi

# Restaurar .env
if [ ! -f .env ] && [ -f /tmp/.env.backup ]; then
    cp /tmp/.env.backup .env
fi

# Instalar dependencias
npm install --production

# Reiniciar PM2
pm2 restart millopsicologia-api

echo "✅ Backend actualizado"
pm2 logs millopsicologia-api --lines 20
```

```bash
chmod +x /var/www/millopsicologia/backend/deploy.sh
```

---

## 1️⃣1️⃣ Deployment del Frontend

### Actualizar entorno TEST

**En tu PC (PowerShell):**
```powershell
# Generar build de producción
cd D:\Proyectos\PsychologyERP-demo\front
ng build --configuration staging

# Subir al servidor
scp -r "dist/psichology-erp/browser/*" root@62.169.18.15:/tmp/dist-test/
```

**En el servidor:**
```bash
/root/update-frontend-test.sh
```

### Script automatizado para TEST

```bash
nano /root/update-frontend-test.sh
```

```bash
#!/bin/bash
echo "🚀 Actualizando frontend TEST..."

# Verificar que existen archivos
if [ ! "$(ls -A /tmp/dist-test)" ]; then
   echo "❌ Error: No hay archivos en /tmp/dist-test"
   echo "Primero sube el dist desde tu PC con:"
   echo 'scp -r "dist/psichology-erp/browser/*" root@62.169.18.15:/tmp/dist-test/'
   exit 1
fi

# Borrar contenido antiguo
echo "🗑️  Limpiando frontend-test..."
rm -rf /var/www/millopsicologia/frontend-test/*

# Copiar nuevo build
echo "📦 Copiando nuevo build..."
cp -r /tmp/dist-test/* /var/www/millopsicologia/frontend-test/

# Permisos correctos
echo "🔒 Aplicando permisos..."
chown -R www-data:www-data /var/www/millopsicologia/frontend-test
chmod -R 755 /var/www/millopsicologia/frontend-test

# Limpiar temporal
rm -rf /tmp/dist-test/*

# Recargar nginx
echo "🔄 Recargando nginx..."
systemctl reload nginx

echo "✅ Frontend TEST actualizado correctamente"
echo "🌐 Disponible en: https://test.millopsicologia.com"
```

```bash
chmod +x /root/update-frontend-test.sh
```

### Pasar de TEST a PRODUCCIÓN

Una vez validado en TEST:

```bash
rm -rf /var/www/millopsicologia/frontend/*
cp -r /var/www/millopsicologia/frontend-test/* /var/www/millopsicologia/frontend/
systemctl reload nginx
echo "✅ Frontend PROD actualizado: https://millopsicologia.com"
```

---

## 1️⃣2️⃣ Comandos útiles

### Nginx
```bash
nginx -t                    # Verificar configuración
systemctl status nginx      # Ver estado
systemctl reload nginx      # Recargar configuración
systemctl restart nginx     # Reiniciar servicio
```

### PM2
```bash
pm2 list                    # Listar procesos
pm2 logs millopsicologia-api         # Ver logs
pm2 restart millopsicologia-api      # Reiniciar app
pm2 stop millopsicologia-api         # Detener app
pm2 save                    # Guardar configuración
```

### MariaDB
```bash
mysql -u root -p                    # Conectar como root
systemctl status mariadb            # Ver estado
systemctl restart mariadb           # Reiniciar servicio
```

### Sistema
```bash
htop                        # Monitor de recursos
df -h                       # Espacio en disco
free -h                     # Memoria RAM
```

### SSL
```bash
certbot certificates        # Ver certificados instalados
certbot renew              # Renovar manualmente
```

---

## 1️⃣3️⃣ Flujo de trabajo completo

### Actualizar Backend

**Local:**
```bash
cd D:\Proyectos\PsychologyERP-demo\back
git add .
git commit -m "Descripción de cambios"
git push origin main
```

**Servidor:**
```bash
ssh root@62.169.18.15
/var/www/millopsicologia/backend/deploy.sh
```

O si prefieres ejecutarlo con ruta relativa:
```bash
cd /var/www/millopsicologia/backend
./deploy.sh
```

### Actualizar Frontend TEST

**Local (PowerShell):**
```powershell
cd D:\Proyectos\PsychologyERP-demo\front
ng build --configuration production
scp -r "dist/psichology-erp/browser/*" root@62.169.18.15:/tmp/dist-test/
```

**Servidor:**
```bash
ssh root@62.169.18.15
/root/update-frontend-test.sh
```

### Promover TEST a PROD

Después de validar en TEST:

**Servidor:**
```bash
ssh root@62.169.18.15
rm -rf /var/www/millopsicologia/frontend/*
cp -r /var/www/millopsicologia/frontend-test/* /var/www/millopsicologia/frontend/
systemctl reload nginx
echo "✅ Frontend PROD actualizado: https://millopsicologia.com"
```

---

## 1️⃣4️⃣ Verificación y troubleshooting

### Verificar estado de servicios

```bash
# Estado de Nginx
systemctl status nginx

# Estado de MariaDB
systemctl status mariadb

# Estado de procesos PM2
pm2 status

# Logs de la API
pm2 logs millopsicologia-api

# Logs de Nginx
tail -f /var/log/nginx/millopsicologia_test_access.log
tail -f /var/log/nginx/millopsicologia_prod_access.log
tail -f /var/log/nginx/millopsicologia_test_error.log
tail -f /var/log/nginx/millopsicologia_prod_error.log
```

### Verificar conectividad a bases de datos

```bash
# Conectar a BD TEST
mysql -u millo_test -p millopsicologia_test

# Conectar a BD PROD
mysql -u millo_prod -p millopsicologia_prod

# Ver bases de datos
SHOW DATABASES;

# Ver tablas
USE millopsicologia_test;
SHOW TABLES;
```

### Verificar certificados SSL

```bash
# Listar certificados
certbot certificates

# Renovar certificados manualmente (si es necesario)
certbot renew

# Test de renovación
certbot renew --dry-run
```

### Limpiar caché del navegador

Si los cambios no se reflejan después de actualizar:

1. Abrir DevTools (F12)
2. Click derecho en el botón de recargar
3. Seleccionar "Vaciar caché y recargar de forma forzada"
4. O abrir en modo incógnito

### Problemas comunes

**API no responde:**
```bash
pm2 logs millopsicologia-api --err
pm2 restart millopsicologia-api
```

**Frontend muestra 502 Bad Gateway:**
```bash
# Verificar que la API está corriendo
pm2 status
# Verificar configuración de Nginx
nginx -t
systemctl restart nginx
```

**Swagger apunta a localhost:**
- Verificar que `NODE_ENV=production` en el `.env`
- Limpiar caché del navegador
- Abrir en modo incógnito

**Git pull falla con "dubious ownership":**
```bash
git config --global --add safe.directory /var/www/millopsicologia/backend
```

---

## 📝 Notas importantes

- La API es única pero conecta a BDs diferentes según el dominio
- TEST usa `millopsicologia_test`, PROD usa `millopsicologia_prod`
- Siempre probar cambios primero en TEST
- Los certificados SSL se renuevan automáticamente
- Hacer backups regulares de BDs y `/var/www/millopsicologia`
- Revisar logs en `/var/log/nginx/` y `pm2 logs` ante problemas

---

**Fecha de configuración:** 30 de septiembre de 2025  
**Servidor:** Contabo VPS - IP: 62.169.18.15  
**Dominio:** millopsicologia.com  
**Repositorio:** https://github.com/dguerrem/PsychologyERP-demo
