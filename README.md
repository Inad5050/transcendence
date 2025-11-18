# ft_transcendence

`ft_transcendence` es una aplicación web full-stack que implementa un ecosistema de juegos en línea, completo con autenticación de usuarios, perfiles, sistema de amigos, chat en tiempo real y torneos.

Este es el úmtimo proyecto del Common Core de **42**.

---

## ✨ Características Principales

### 1. Autenticación y Seguridad (Backend)

* **Autenticación JWT Robusta:** Sistema completo de sesiones basado en JSON Web Tokens, utilizando **Access Tokens** de corta duración y **Refresh Tokens** de larga duración para una seguridad y persistencia de sesión óptimas.
* **Autenticación de Dos Factores (2FA):** Implementación completa de TOTP (Time-based One-Time Password) compatible con Google Authenticator. Incluye generación de secreto, despliegue de **código QR** y flujos de verificación y desactivación.
* **Gestión Segura de Contraseñas:** Hash de contraseñas utilizando `bcrypt` con rondas de sal configurables.
* **Middleware de Protección:** Las rutas de la API están protegidas mediante un middleware que valida el JWT en cada solicitud.

### 2. Jugabilidad y Lógica de Juego (Frontend/Backend)

* **Motor de Pong 2D:** Una implementación del juego que utiliza un motor de renderizado 2D para el bucle de renderizado, la gestión de la física y la detección de colisiones.
* **Múltiples Modos de Juego:**
    * **1v1 Local:** Dos jugadores en la misma máquina.
    * **1v1 vs. IA:** Un jugador contra una IA con múltiples niveles de dificultad (Fácil, Medio, Difícil, Imposible).
    * **4-Player FFA:** Un modo "todos contra todos" (free-for-all) donde los jugadores son eliminados al perder.
    * **Modos Personalizados:** Partidas con modificadores como obstáculos en el mapa o velocidades personalizadas de la bola y la pala.
* **Sistema de ELO:** Los usuarios tienen una puntuación ELO que se actualiza automáticamente después de cada partida clasificatoria.
* **Juego Adicional:** Implementación de **Tic-Tac-Toe** con modos 1v1 local y 1vAI.

### 3. Sistema Social y Perfiles

* **Perfiles de Usuario:** Los usuarios pueden ver sus estadísticas (victorias, derrotas, ELO) y su historial de partidas.
* **Subida de Avatares:** Los usuarios pueden subir y actualizar su foto de perfil, que se almacena en un volumen persistente del backend.
* **Sistema de Amigos:** Flujo completo para enviar, aceptar, rechazar y eliminar solicitudes de amistad.
* **Chat en Tiempo Real:** Un sistema de chat funcional (basado en polling `setInterval`) que permite **mensajes privados** entre amigos y un **chat público** global.
* **Estado de Conexión:** El sistema rastrea la actividad del usuario y lo marca como 'online' u 'offline' (con un trabajo programado para detectar inactividad).

### 4. Torneos

* **Creación y Gestión de Torneos:** Los usuarios pueden crear torneos de Pong de 4, 8 o 16 jugadores.
* **Generación de Brackets:** El backend genera y gestiona automáticamente el árbol de emparejamientos del torneo.
* **Soporte para Jugadores Locales:** El creador del torneo puede añadir a amigos o rellenar huecos con jugadores "invitados" locales.
* **Visualización Dinámica:** El frontend renderiza el estado actual del bracket, mostrando los ganadores y las próximas partidas.

### 5. Arquitectura y Stack

* **Full-Stack TypeScript:** El proyecto utiliza TypeScript tanto en el frontend (Vite) como en el backend (Node.js con type: "module"), asegurando la coherencia y la seguridad de tipos.
* **Contenerización Completa:** Todo el proyecto está orquestado con **Docker Compose**, definiendo servicios separados para el frontend, el backend y un reverse proxy Nginx.
* **Internacionalización (i18n):** El frontend tiene soporte completo para múltiples idiomas (Inglés, Español, Francés) utilizando `i18next`.
* **SPA Moderna:** El frontend es una **Single Page Application (SPA)** construida con Vite, TypeScript y TailwindCSS, utilizando un enrutador del lado del cliente.

---

## 🛠️ Stack Tecnológico

| Área | Tecnología | Propósito |
| :--- | :--- | :--- |
| **Frontend** | **TypeScript** | Lenguaje principal |
| | **Vite** | Servidor de desarrollo y empaquetador |
| | **Babylon.js** | Motor de renderizado 2D para Pong |
| | **TailwindCSS** | Framework de CSS para diseño de UI |
| | **i18next** | Gestión de internacionalización (multi-idioma) |
| **Backend** | **Node.js** | Entorno de ejecución |
| | **Fastify** | Framework web |
| | **Sequelize** | ORM para la gestión de la base de datos |
| | **SQLite** | Base de datos SQL ligera |
| | **JWT (`jsonwebtoken`)** | Generación y verificación de tokens de acceso/refresco |
| | **`speakeasy` / `qrcode`** | Implementación de lógica 2FA (TOTP) |
| **DevOps** | **Docker / Docker Compose** | Contenerización y orquestación de servicios |
| | **Nginx** | Reverse proxy, enrutamiento y servicio de SSL |
| | **Makefile** | Comandos de utilidad para la gestión de Docker |

---

## 🚀 Cómo Empezar

### Prerrequisitos

Asegúrate de tener instaladas las siguientes herramientas en tu sistema:
* [Docker](https://www.docker.com/get-started)
* [Docker Compose](https://docs.docker.com/compose/install/)
* `make` (generalmente incluido en sistemas Linux/macOS)
* `openssl` (para generar certificados)

### Instalación y Ejecución

1.  **Clonar el repositorio**
    ```sh
    git clone <URL-DEL-REPOSITORIO>
    cd trascendence
    ```

2.  **Crear el archivo de entorno**
    El proyecto requiere un archivo `.env` para las variables de entorno del backend. Este archivo debe estar ubicado en `.secrets/.env`.

    ```sh
    mkdir .secrets
    touch .secrets/.env
    ```

3.  **Configurar las variables de entorno**
    Abre `.secrets/.env` y añade las variables obligatorias:

    ```env
    # Secreto para firmar los JWT
    CLAVE_PRIVADA=tu_secreto_jwt_muy_seguro_de_al_menos_32_caracteres
    
    # Tiempos de expiración de tokens
    EXPIRE_IN=1h
    REFRESH_TOKEN=7d
    
    # Rondas de sal para Bcrypt
    SALT_ROUNDS=10
    
    # Puerto del backend
    PORT=9000
    ```

4.  **Generar certificados SSL (para Nginx)**
    El contenedor de Nginx espera certificados SSL en `.secrets/ssl/`. Para desarrollo local, puedes generar uno autofirmado:
    ```sh
    mkdir .secrets/ssl
    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout .secrets/ssl/nginx-selfsigned.key \
        -out .secrets/ssl/nginx-selfsigned.crt \
        -subj "/C=ES/ST=Madrid/L=Madrid/O=42/OU=student/CN=localhost"
    ```

5.  **Construir e iniciar los contenedores**
    El `Makefile` proporciona comandos sencillos para gestionar el stack de Docker.
    ```sh
    make up
    ```
    Este comando construirá las imágenes (`--build`) e iniciará los servicios en modo demonio (`--detach`).

6.  **Acceder a la aplicación**
    Una vez que los contenedores estén en funcionamiento, puedes acceder a la aplicación en tu navegador:

    **`https://localhost:8443`**

    (Es posible que necesites aceptar la advertencia de seguridad de tu navegador debido al certificado autofirmado).

### Comandos Útiles del Makefile

* **Iniciar servicios:** `make up`
* **Detener servicios:** `make down`
* **Reconstruir y reiniciar:** `make rebuild`
* **Limpiar Docker (imágenes, volúmenes):** `make prune`

---
