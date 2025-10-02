# 📚 GUÍA COMPLETA: Implementación de 2FA con TOTP y JWT

## 🎯 Resumen de lo Implementado

Se han implementado dos sistemas de seguridad:
1. **JWT (JSON Web Tokens)** para gestión de sesiones
2. **2FA con TOTP** (Time-based One-Time Password) compatible con Google Authenticator

---

## 📂 Archivos Creados/Modificados

### Nuevos Archivos:
- `backend/models/Session.js` - Modelo para almacenar tokens JWT activos
- `backend/utils/jwtUtils.js` - Utilidades para generar y validar JWT
- `backend/utils/twoFAUtils.js` - Utilidades para 2FA con TOTP

### Archivos Modificados:
- `backend/controllers/Auth.js` - Controlador con lógica de autenticación
- `backend/middleware/authMiddleware.js` - Middleware para proteger rutas
- `backend/rutas.js` - Rutas actualizadas con nuevos endpoints

---

## �� FASE 1: Sistema JWT - Sesiones con Tokens

### ¿Cómo Funciona?

1. **Login exitoso** → Se generan 2 tokens:
   - `access_token` (1 hora) - Para hacer peticiones
   - `refresh_token` (7 días) - Para renovar el access_token

2. **Tokens guardados en BD** → En tabla `sessions`:
   - Token, user_id, IP, user agent, fecha de expiración
   - Estado activo/inactivo

3. **Middleware valida** → En cada petición protegida:
   - Verifica firma del JWT
   - Comprueba que exista en BD y esté activo
   - Valida que no haya expirado

### Endpoints JWT

#### 1. Login (Público)
```bash
POST /auth/login
Content-Type: application/json

{
  "username": "usuario",
  "password": "contraseña",
  "twofa_code": "123456"  # Opcional, solo si tiene 2FA activado
}

# Respuesta exitosa:
{
  "status": true,
  "message": "Login exitoso",
  "user": { ...datos del usuario... },
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 2. Validar Sesión (Protegido)
```bash
GET /auth/validate
Authorization: Bearer <access_token>

# Respuesta:
{
  "status": true,
  "message": "Sesión válida",
  "user": {
    "id": 1,
    "username": "usuario",
    "email": "email@ejemplo.com"
  }
}
```

#### 3. Refrescar Token (Público)
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

# Respuesta:
{
  "status": true,
  "message": "Token refrescado",
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 4. Logout (Público)
```bash
POST /auth/logout
Authorization: Bearer <access_token>

# Respuesta:
{
  "status": true,
  "message": "Logout exitoso"
}
```

---

## 🔒 FASE 2: Sistema 2FA con TOTP

### ¿Cómo Funciona?

1. **Usuario activa 2FA**:
   - Se genera un secreto único
   - Se crea código QR
   - Usuario escanea con Google Authenticator

2. **Login con 2FA**:
   - Usuario ingresa usuario/contraseña
   - Si tiene 2FA → pide código de 6 dígitos
   - Código válido 30 segundos (TOTP)

3. **Seguridad**:
   - Secreto guardado encriptado en BD
   - Códigos rotan cada 30 segundos
   - No se puede reutilizar código

### Endpoints 2FA

#### 1. Configurar 2FA (Protegido)
```bash
POST /auth/2fa/setup
Authorization: Bearer <access_token>

# Respuesta:
{
  "status": true,
  "message": "Secreto 2FA generado. Escanea el código QR con Google Authenticator",
  "secret": "JBSWY3DPEHPK3PXP",
  "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEU...",
  "otpauth_url": "otpauth://totp/ft_transcendence%20(usuario)?secret=JBSWY3DPEHPK3PXP"
}
```

**Pasos del usuario:**
1. Obtener el QR code
2. Abrir Google Authenticator en el móvil
3. Escanear el código QR
4. Guardar el código que aparece

#### 2. Activar 2FA (Protegido)
```bash
POST /auth/2fa/enable
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "code": "123456"  # Código de Google Authenticator
}

# Respuesta:
{
  "status": true,
  "message": "2FA activado exitosamente"
}
```

#### 3. Desactivar 2FA (Protegido)
```bash
POST /auth/2fa/disable
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "code": "123456",      # Código de Google Authenticator
  "password": "contraseña"  # Contraseña actual
}

# Respuesta:
{
  "status": true,
  "message": "2FA desactivado. Todas las sesiones han sido cerradas por seguridad"
}
```

---

## 🚀 Flujo de Uso Completo

### Caso 1: Usuario SIN 2FA

```javascript
// 1. Login
const loginResponse = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'usuario',
    password: 'contraseña'
  })
});

const { access_token, refresh_token } = await loginResponse.json();

// 2. Hacer peticiones autenticadas
const profileResponse = await fetch('/users/me', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

// 3. Si el token expira, refrescarlo
const refreshResponse = await fetch('/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ refresh_token })
});

const { access_token: newToken } = await refreshResponse.json();
```

### Caso 2: Usuario CON 2FA

```javascript
// 1. Login (primera vez sin código)
const loginAttempt = await fetch('/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'usuario',
    password: 'contraseña'
  })
});

const response = await loginAttempt.json();

if (response.requires_2fa) {
  // 2. Pedir código 2FA al usuario
  const code = prompt('Ingresa código de Google Authenticator:');
  
  // 3. Login con código 2FA
  const loginWith2FA = await fetch('/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'usuario',
      password: 'contraseña',
      twofa_code: code
    })
  });
  
  const { access_token } = await loginWith2FA.json();
}
```

### Caso 3: Activar 2FA

```javascript
// 1. Usuario ya está logueado con access_token

// 2. Solicitar configuración 2FA
const setupResponse = await fetch('/auth/2fa/setup', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

const { qr_code, secret } = await setupResponse.json();

// 3. Mostrar QR al usuario
// <img src="${qr_code}" />

// 4. Usuario escanea con Google Authenticator

// 5. Verificar y activar con el código
const code = prompt('Ingresa código de Google Authenticator:');

const enableResponse = await fetch('/auth/2fa/enable', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ code })
});

// 6. 2FA activado!
```

---

## 🛡️ Proteger Rutas

Para proteger cualquier ruta, agrega el middleware:

```javascript
// En rutas.js
{
  method: "GET",
  url: "/ruta-protegida",
  preHandler: authMiddleware,  // <- Esto la protege
  handler: MiController.miMetodo,
}
```

---

## ⚙️ Variables de Entorno

Agrega estas variables a tu archivo `.env`:

```bash
# JWT Configuration
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion
JWT_EXPIRES_IN=1h
REFRESH_TOKEN_EXPIRES_IN=7d

# Password Hashing
SALT_ROUNDS=10
```

---

## 🧪 Probar con cURL

### 1. Login simple
```bash
curl -X POST http://localhost:9000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123"}'
```

### 2. Validar sesión
```bash
curl -X GET http://localhost:9000/auth/validate \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### 3. Configurar 2FA
```bash
curl -X POST http://localhost:9000/auth/2fa/setup \
  -H "Authorization: Bearer TU_ACCESS_TOKEN"
```

### 4. Activar 2FA
```bash
curl -X POST http://localhost:9000/auth/2fa/enable \
  -H "Authorization: Bearer TU_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"code":"123456"}'
```

### 5. Login con 2FA
```bash
curl -X POST http://localhost:9000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"test","password":"test123","twofa_code":"123456"}'
```

---

## 📱 Aplicaciones Compatibles con TOTP

- **Google Authenticator** (iOS/Android)
- **Microsoft Authenticator** (iOS/Android)
- **Authy** (iOS/Android/Desktop)
- **1Password** (con soporte TOTP)

---

## 🔍 Estructura de Base de Datos

### Tabla `users` (ya existente, con campos añadidos):
- `twofa_secret` - Secreto TOTP (encriptado)
- `twofa_enabled` - Boolean si tiene 2FA activo

### Tabla `sessions` (nueva):
- `id` - ID único
- `user_id` - FK a users
- `token` - Access token JWT
- `refresh_token` - Refresh token JWT
- `ip_address` - IP del cliente
- `user_agent` - Navegador/app del cliente
- `expires_at` - Fecha de expiración
- `is_active` - Si la sesión está activa
- `createdAt` - Fecha de creación
- `updatedAt` - Última actualización

---

## 🎓 Conceptos Importantes

### JWT (JSON Web Token)
- Token firmado digitalmente
- Contiene información del usuario
- No necesita consultar BD en cada petición (pero nosotros sí lo hacemos para poder invalidar)
- Se envía en header: `Authorization: Bearer <token>`

### TOTP (Time-based One-Time Password)
- Código de 6 dígitos
- Cambia cada 30 segundos
- Generado con algoritmo SHA-1
- Sincronizado por tiempo (no requiere conexión)

### Access Token vs Refresh Token
- **Access Token**: Corta duración (1h), para hacer peticiones
- **Refresh Token**: Larga duración (7d), solo para renovar access token

---

## ⚠️ Seguridad

1. **NUNCA** expongas `JWT_SECRET` en código público
2. **SIEMPRE** usa HTTPS en producción
3. **GUARDA** los refresh tokens de forma segura en el cliente
4. **LIMPIA** sesiones expiradas periódicamente
5. **VALIDA** siempre los tokens en el backend

---

## 📝 TODO / Mejoras Futuras

- [ ] Rate limiting en login (prevenir fuerza bruta)
- [ ] Códigos de recuperación backup (si pierdes el móvil)
- [ ] Notificaciones por email en login nuevo
- [ ] Lista de sesiones activas para el usuario
- [ ] Revocar sesiones individuales
- [ ] Limpieza automática de sesiones expiradas (cron job)

---

## 🐛 Troubleshooting

### Error: "Token inválido o expirado"
- Verifica que el token no haya expirado
- Usa el refresh token para obtener uno nuevo

### Error: "Código 2FA inválido"
- Verifica que el reloj del servidor esté sincronizado
- El código cambia cada 30 segundos
- Asegúrate de ingresar el código actual

### Error: "Sesión no encontrada"
- El token fue invalidado (logout)
- La sesión expiró
- Haz login nuevamente

---

## 📞 Soporte

Para dudas sobre la implementación:
1. Revisa los comentarios en el código
2. Prueba con los ejemplos de cURL
3. Verifica los logs del servidor
