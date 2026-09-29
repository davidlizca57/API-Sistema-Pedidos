-- =========================================================================
-- SCRIPT ESTRUCTURAL DE LA BASE DE DATOS RELACIONAL: SISTEMA INTELIGENTE DE PEDIDOS
-- COMPREHENSIVE INTEGRATION - ADSO SENA
-- =========================================================================

CREATE DATABASE IF NOT EXISTS sistema_pedidos;
USE sistema_pedidos;

-- 1. TABLA DE USUARIOS (Con soporte para Hashes extensos de Bcrypt)
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL, -- Longitud idónea para almacenar hash de Bcrypt
    rol VARCHAR(50) DEFAULT 'cliente',
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABLA DE PRODUCTOS (Estructura base del catálogo del restaurante)
CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL
);

-- 3. TABLA DE PEDIDOS (Cabecera de transacciones conectada al cliente)
CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(50) DEFAULT 'Pendiente',
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- 4. TABLA DE DETALLES DE PEDIDOS (Relación rompe-muchos de productos consumidos)
CREATE TABLE IF NOT EXISTS detalles_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    FOREIGN KEY (producto_id) REFERENCES productos(id) ON DELETE CASCADE
);

-- =========================================================================
-- INSERCIÓN DE DATOS SEMILLA PARA PRUEBAS FUNCIONALES
-- =========================================================================
INSERT INTO productos (nombre, descripcion, precio, categoria) VALUES 
('Hamburguesa Especial SIP', 'Carne 150g, queso cheddar, tocino y salsa de la casa.', 18500.00, 'comidas'),
('Pizza Pepperoni Personal', 'Masa artesanal, salsa de tomate y abundante pepperoni.', 15000.00, 'comidas'),
('Limonada Cerezada', 'Bebida refrescante natural con cerezas seleccionadas.', 7500.00, 'bebidas')
ON DUPLICATE KEY UPDATE nombre=nombre;
