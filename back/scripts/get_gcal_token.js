const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Determinar el entorno desde argumentos de línea de comandos
// Uso: node get_gcal_token.js [test|production]
const environment = process.argv[2] || 'test';

if (!['test', 'production'].includes(environment)) {
  console.error('❌ Entorno inválido. Usa: node get_gcal_token.js [test|production]');
  process.exit(1);
}

const CREDENTIALS_PATH = path.join(__dirname, `../.secret/credentials.${environment}.json`);
const TOKEN_PATH = path.join(__dirname, `../.secret/token.${environment}.json`);

console.log(`\n🔐 Generando token para entorno: ${environment.toUpperCase()}`);
console.log(`📁 Buscando credenciales en: ${path.basename(CREDENTIALS_PATH)}\n`);

(async () => {
  try {
    if (!fs.existsSync(CREDENTIALS_PATH)) {
      console.error('❌ No se encontró el archivo de credenciales en', CREDENTIALS_PATH);
      console.error('\n💡 Asegúrate de tener el archivo credentials.' + environment + '.json en la carpeta .secret/');
      process.exit(1);
    }

    const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
    let client_id, client_secret, redirect_uris;
    if (credentials.web) {
      ({ client_id, client_secret, redirect_uris } = credentials.web);
      console.log('✅ Tipo de credenciales: web');
    } else if (credentials.installed) {
      ({ client_id, client_secret, redirect_uris } = credentials.installed);
      console.log('✅ Tipo de credenciales: installed (desktop)');
    } else {
      throw new Error('Invalid credentials.json: missing web or installed');
    }

    const oAuth2Client = new google.auth.OAuth2(
      client_id,
      client_secret,
      (redirect_uris && redirect_uris.length > 0) ? redirect_uris[0] : undefined
    );

    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
    });

    console.log('\n🔗 Visita la siguiente URL en un navegador y acepta los permisos:');
    console.log('─'.repeat(80));
    console.log(authUrl);
    console.log('─'.repeat(80) + '\n');

    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question('📋 Pega el código de autorización aquí: ', async (code) => {
      rl.close();
      try {
        const { tokens } = await oAuth2Client.getToken(code.trim());
        // Guardar token
        fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
        fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
        console.log('\n✅ Token guardado exitosamente en:', path.basename(TOKEN_PATH));
        console.log('🔒 Asegúrate de mantener este archivo seguro y nunca commitearlo al repositorio.\n');
      } catch (err) {
        console.error('\n❌ Error al obtener token:', err.response?.data || err.message);
      }
    });

  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
