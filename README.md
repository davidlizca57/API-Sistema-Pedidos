# API Sistema de Pedidos (SIP)

## Descripción
API REST básica desarrollada con Node.js y Express para la gestión de usuarios del proyecto formativo SIP (SENA).

## Tecnologías Utilizadas
- Node.js
- Express
- MySQL
- Postman
- Git / GitHub

## Instrucciones de Ejecución
1. Clonar el repositorio.
2. Importar la base de datos en MySQL Workbench.
3. Ejecutar en la consola: `npm install`
4. Iniciar el servidor con: `node src/app.js`

## Endpoints Principales
- `GET /api/usuarios` - Consultar usuarios
- `POST /api/usuarios` - Registrar usuario
- `POST /api/usuarios/login` - Iniciar sesión
