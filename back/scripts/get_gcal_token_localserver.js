const express = require('express');
const { google } = require('googleapis');
const fs = require('fs');
const path = require('path');

const CREDENTIALS_PATH = path.join(__dirname, '../.secret/credentials.test.json');
const TOKEN_PATH = path.join(__dirname, '../.secret/token.test.json');

const PORT = process.env.PORT || 3000;
const PUBLIC_BASE = process.env.REDIRECT_HOST || `http://localhost:${PORT}`; // can be ngrok URL

if (!fs.existsSync(CREDENTIALS_PATH)) {
  console.error('No se encontró', CREDENTIALS_PATH);
  process.exit(1);
}

const credentials = JSON.parse(fs.readFileSync(CREDENTIALS_PATH));
let client_id, client_secret, redirect_uris;
if (credentials.web) {
  ({ client_id, client_secret, redirect_uris } = credentials.web);
} else if (credentials.installed) {
  ({ client_id, client_secret, redirect_uris } = credentials.installed);
} else {
  console.error('credentials.json inválido: falta web o installed');
  process.exit(1);
}

// Use the public host (ngrok) as redirect URI if provided via REDIRECT_HOST env var
const redirectUri = `${PUBLIC_BASE.replace(/\/$/, '')}/oauth2callback`;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirectUri
);

const app = express();

app.get('/', (req, res) => {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: ['https://www.googleapis.com/auth/calendar.events'],
    redirect_uri: redirectUri,
  });

  res.send(`Abre esta URL para autorizar:\n\n<a href="${authUrl}">${authUrl}</a>`);
});

app.get('/oauth2callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('Falta code');

  try {
    const { tokens } = await oAuth2Client.getToken(code);
    fs.mkdirSync(path.dirname(TOKEN_PATH), { recursive: true });
    fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
    console.log('Token guardado en', TOKEN_PATH);
    res.send('Autorización completada. Token guardado. Puedes cerrar esta ventana.');
    process.exit(0);
  } catch (err) {
    console.error('Error intercambiando token:', err.response?.data || err.message);
    res.status(500).send('Error al intercambiar token. Revisa la terminal.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor local escuchando en http://localhost:${PORT}`);
  console.log(`Si usas ngrok, establece REDIRECT_HOST a la URL pública (sin /oauth2callback). Ej: export REDIRECT_HOST=https://abcd1234.ngrok.io`);
  console.log(`La URL de autorización estará disponible en http://localhost:${PORT} (o en la URL pública de ngrok).`);
  console.log(`Redirect URI configurada para OAuth: ${redirectUri}`);
});
