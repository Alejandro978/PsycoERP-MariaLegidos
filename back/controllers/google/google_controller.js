const fs = require('fs');
const logger = require("../../utils/logger");
const path = require('path');
const { google } = require('googleapis');
const { getGoogleCredentialsPath } = require('../../config/googleMeet');

/**
 * Carga las credenciales según el hostname
 * @param {string} hostname - Hostname de la request
 * @returns {Object} Credenciales de Google OAuth
 */
function loadCredentials(hostname) {
  const paths = getGoogleCredentialsPath(hostname);
  
  if (!fs.existsSync(paths.credentials)) {
    throw new Error(`credentials.json not found: ${paths.credentials}`);
  }
  
  const credentials = JSON.parse(fs.readFileSync(paths.credentials));
  if (credentials.web) return { creds: credentials.web, paths };
  if (credentials.installed) return { creds: credentials.installed, paths };
  throw new Error('Invalid credentials.json: missing web or installed');
}

/**
 * Crea un cliente OAuth2 según el hostname
 * @param {string} hostname - Hostname de la request
 * @returns {Object} Cliente OAuth2 y paths
 */
function createOAuthClient(hostname) {
  const { creds, paths } = loadCredentials(hostname);
  const { client_id, client_secret, redirect_uris } = creds;
  const oAuth2Client = new google.auth.OAuth2(
    client_id, 
    client_secret, 
    redirect_uris && redirect_uris[0]
  );
  return { oAuth2Client, paths };
}

/**
 * GET /api/google/auth
 * Genera la URL de autorización para que la usuaria autorice la app
 */
exports.getAuthUrl = (req, res) => {
  try {
    const hostname = req.hostname || 'production';
    const { oAuth2Client, paths } = createOAuthClient(hostname);
    
    const authUrl = oAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
    });
    
    logger.log(`🔐 Generated auth URL for ${paths.environment}`);
    
    res.json({ 
      success: true,
      authUrl,
      environment: paths.environment,
      instructions: 'Visit this URL to authorize the application'
    });
  } catch (err) {
    logger.error('Error generating auth URL', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};

/**
 * GET /api/google/oauth2callback?code=...
 * Callback de OAuth2 - intercambia el código por tokens y los guarda
 */
exports.oauth2callback = async (req, res) => {
  const code = req.query.code;
  if (!code) {
    return res.status(400).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>❌ Error</h1>
          <p>Missing authorization code</p>
        </body>
      </html>
    `);
  }

  try {
    const hostname = req.hostname || 'production';
    const { oAuth2Client, paths } = createOAuthClient(hostname);
    
    logger.log(`🔄 Exchanging code for tokens (${paths.environment})...`);
    
    const { tokens } = await oAuth2Client.getToken(code);
    
    // Guardar tokens en el archivo apropiado
    fs.writeFileSync(paths.token, JSON.stringify(tokens, null, 2));
    
    logger.log(`✅ Token saved successfully to ${paths.token}`);
    
    res.send(`
      <html>
        <head>
          <title>Authorization Successful</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 40px;
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              background: white;
              color: #333;
              padding: 40px;
              border-radius: 10px;
              max-width: 500px;
              margin: 0 auto;
              box-shadow: 0 10px 40px rgba(0,0,0,0.2);
            }
            h1 { color: #28a745; margin: 0 0 20px; }
            p { line-height: 1.6; margin: 10px 0; }
            .success-icon { font-size: 60px; margin-bottom: 20px; }
            .env-badge {
              display: inline-block;
              background: #667eea;
              color: white;
              padding: 5px 15px;
              border-radius: 20px;
              font-size: 12px;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success-icon">✅</div>
            <h1>¡Autorización Exitosa!</h1>
            <p>El token de Google Calendar ha sido guardado correctamente.</p>
            <p>Los recordatorios con Google Meet funcionarán automáticamente.</p>
            <p><strong>Puedes cerrar esta ventana.</strong></p>
            <div class="env-badge">${paths.environment}</div>
          </div>
        </body>
      </html>
    `);
  } catch (err) {
    logger.error('Error exchanging code for token', err);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; padding: 40px; text-align: center;">
          <h1>❌ Error</h1>
          <p>Error obtaining token: ${err.message}</p>
          <p>Please contact support.</p>
        </body>
      </html>
    `);
  }
};

/**
 * GET /api/google/status
 * Verifica el estado del token actual
 */
exports.getTokenStatus = async (req, res) => {
  try {
    const hostname = req.hostname || 'production';
    const paths = getGoogleCredentialsPath(hostname);
    
    if (!fs.existsSync(paths.token)) {
      return res.json({
        success: true,
        environment: paths.environment,
        hasToken: false,
        message: 'No token found. Authorization needed.'
      });
    }
    
    const token = JSON.parse(fs.readFileSync(paths.token));
    const hasRefreshToken = !!token.refresh_token;
    const expiryDate = token.expiry_date ? new Date(token.expiry_date) : null;
    const isExpired = expiryDate ? Date.now() >= expiryDate.getTime() : false;
    
    res.json({
      success: true,
      environment: paths.environment,
      hasToken: true,
      hasRefreshToken,
      expiryDate: expiryDate ? expiryDate.toISOString() : null,
      isExpired,
      message: hasRefreshToken 
        ? 'Token is valid and will auto-renew' 
        : 'Token found but missing refresh_token. Consider reauthorizing.'
    });
  } catch (err) {
    logger.error('Error checking token status', err);
    res.status(500).json({ 
      success: false,
      error: err.message 
    });
  }
};
