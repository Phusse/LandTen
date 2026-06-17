const crypto = require('crypto');
function base64url(str) {
    return Buffer.from(str).toString('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
const header = { alg: 'HS256', typ: 'JWT' };
const payload = {
  sub: "12345678-1234-1234-1234-123456789012",
  email: "testlandlord@dev.com",
  role: "landlord",
  verification_status: "verified",
  nbf: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + 3600,
  iss: "LandTen",
  aud: "LandTen"
};
const encodedHeader = base64url(JSON.stringify(header));
const encodedPayload = base64url(JSON.stringify(payload));
const signature = crypto.createHmac('sha256', "SuperSecretKeyForDevelopmentOnlyPleaseChangeLater").update(encodedHeader + '.' + encodedPayload).digest('base64').replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
console.log(`${encodedHeader}.${encodedPayload}.${signature}`);
