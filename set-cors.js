/**
 * Apply CORS to Firebase Storage using direct Google API call with JWT auth
 */
const https = require('https');
const crypto = require('crypto');
const serviceAccount = require('C:/Users/Admin/Downloads/pg-project-b8e78-firebase-adminsdk-fbsvc-d10ba7ba05.json');

const bucketName = 'pg-project-b8e78.firebasestorage.app';

const corsConfig = [
  {
    origin: ['*'],
    method: ['GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'OPTIONS'],
    maxAgeSeconds: 3600,
    responseHeader: [
      'Content-Type',
      'Authorization',
      'Content-Length',
      'X-Requested-With',
      'x-goog-resumable',
    ],
  },
];

function base64url(str) {
  return Buffer.from(str).toString('base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

function signJwt(payload, privateKey) {
  const header = base64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const body = base64url(JSON.stringify(payload));
  const signature = crypto
    .createSign('RSA-SHA256')
    .update(`${header}.${body}`)
    .sign(privateKey, 'base64')
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  return `${header}.${body}.${signature}`;
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  const jwt = signJwt({
    iss: serviceAccount.client_email,
    scope: 'https://www.googleapis.com/auth/devstorage.full_control',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  }, serviceAccount.private_key);

  return new Promise((resolve, reject) => {
    const body = `grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion=${jwt}`;
    const options = {
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.access_token) resolve(parsed.access_token);
          else reject(new Error(`Token error: ${data}`));
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function setCors(token) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ cors: corsConfig });
    const options = {
      hostname: 'storage.googleapis.com',
      path: `/storage/v1/b/${encodeURIComponent(bucketName)}?fields=cors`,
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode === 200) resolve(JSON.parse(data));
        else reject(new Error(`CORS set failed (${res.statusCode}): ${data}`));
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('Getting access token...');
  const token = await getAccessToken();
  console.log('✅ Access token acquired');

  console.log('Applying CORS configuration...');
  const result = await setCors(token);
  console.log('✅ CORS applied successfully!');
  console.log('CORS config:', JSON.stringify(result.cors, null, 2));
}

main().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
