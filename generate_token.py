import jwt
import time

payload = {
  "sub": "12345678-1234-1234-1234-123456789012",
  "email": "testlandlord@dev.com",
  "role": "landlord",
  "verification_status": "verified",
  "nbf": int(time.time()),
  "exp": int(time.time()) + 3600,
  "iss": "LandTen",
  "aud": "LandTen"
}

token = jwt.encode(payload, "SuperSecretKeyForDevelopmentOnlyPleaseChangeLater", algorithm="HS256")
print(token)
