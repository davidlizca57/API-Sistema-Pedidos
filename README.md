# Sistema Inteligente de Pedidos (SIP) - Fast Casual

Esolución de software Full-Stack integrada para la gestión de usuarios, autenticación segura y procesamiento relacional de comandas en tiempo real. Developed under a decoupled architecture (Backend API REST & Frontend SPA).

## 🚀 Arquitectura y Tecnologías
- **Backend:** Node.js, Express, MySQL (Persistencia Relacional)
- **Frontend:** React, Vite, JavaScript (Componentes Modulares y SPA)
- **Seguridad:** Cifrado criptográfico de contraseñas mediante **Bcrypt**
- **Variables de Entorno:** Gestión segura mediante `dotenv`

---

## 🛠️ Requisitos e Instalación Local

### 1. Base de Datos (MySQL)
1. Abra su entorno MySQL Workbench o terminal.
2. Ejecute el script estructural incluido en el archivo `schema.sql` de la raíz para inicializar la base de datos `sistema_pedidos` y las tablas relacionales (`usuarios`, `productos`, `pedidos`, `detalles_pedidos`).

### 2. Configuración del Servidor (Backend)
1. En la raíz del proyecto, instale las dependencias de Node.js:
   ```bash
   npm install
   ```
2. Cree un archivo `.env` guiándose de la plantilla `.env.example` e inyecte sus credenciales locales:
   ```text
   PORT=3000
   DB_HOST=localhost
   DB_USER=su_usuario
   DB_PASSWORD=su_contraseña
   DB_NAME=sistema_pedidos
   ```
3. Inicie el servidor de la API REST:
   ```bash
   node src/app.js
   ```

### 3. Configuración de la Interfaz Gráfica (Frontend)
1. Muévase al directorio del cliente en una segunda terminal:
   ```bash
   cd frontend-react
   ```
2. Instale los paquetes del ecosistema de React:
   ```bash
   npm install
   ```
3. Ejecute el servidor de desarrollo local mediante Vite:
   ```bash
   npm run dev
   ```
4. Abra su navegador e ingrese a la dirección: `http://localhost:5173/`

---

## 🌐 Endpoints Principales de la API (Endpoints Disponibles)

### Módulo de Usuarios
- `GET /api/usuarios` - Lista general de cuentas de usuario registrados.
- `POST /api/usuarios` - Registro de nuevos usuarios (Cifrado asíncrono Bcrypt).
- `POST /api/usuarios/login` - Autenticación y control de accesos con hashing seguro.

### Módulo de Productos (Catálogo Sincronizado)
- `GET /api/productos` - Extracción dinámica del menú (Hamburguesa, Pizza, Limonada).

### Módulo de Pedidos e Integración
- `POST /api/pedidos` - Procesamiento transaccional de órdenes e inserción masiva en tablas de detalles.
- `GET /api/pedidos` - Historial relacional consolidado mediante INNER JOINs.

---
*Proyecto formativo desarrollado por David Steban Lizcano Andrade para la competencia de Diseño y Desarrollo de Servicios Web - ADSO Sena.*
