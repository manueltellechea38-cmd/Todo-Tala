-- Todo Tala v0.6.0

create database if not exists baseplataforma;
use baseplataforma;


-- =========================
-- USUARIOS
-- =========================

CREATE TABLE usuario (
    id_persona INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    cedula VARCHAR(20) NOT NULL UNIQUE,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contraseña VARCHAR(255) NOT NULL,
    fecha_nacimiento DATE,
    fecha_registro DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN NOT NULL DEFAULT TRUE
);


CREATE TABLE cliente (
    id_persona INT PRIMARY KEY,
    FOREIGN KEY (id_persona) REFERENCES usuario(id_persona)
);


CREATE TABLE jefe (
    id_persona INT PRIMARY KEY,
    FOREIGN KEY (id_persona) REFERENCES usuario(id_persona)
);


-- =========================
-- COMERCIOS Y EMPLEADOS
-- =========================

CREATE TABLE comercio (
    id_comercio INT AUTO_INCREMENT PRIMARY KEY,
    id_jefe INT NOT NULL UNIQUE,
    nombre VARCHAR(100) NOT NULL,
    ruc VARCHAR(20) NOT NULL UNIQUE,
    telefono VARCHAR(20),
    direccion VARCHAR(150),
    horario VARCHAR(100),
    FOREIGN KEY (id_jefe) REFERENCES jefe(id_persona)
);


CREATE TABLE empleado (
    id_persona INT PRIMARY KEY,
    id_comercio INT NOT NULL,
    FOREIGN KEY (id_persona) REFERENCES usuario(id_persona),
    FOREIGN KEY (id_comercio) REFERENCES comercio(id_comercio)
);


-- =========================
-- CATEGORIAS Y PRODUCTOS
-- =========================

CREATE TABLE categoria (
    id_categoria INT AUTO_INCREMENT PRIMARY KEY,
    descripcion VARCHAR(200),
    nombre VARCHAR(100) NOT NULL UNIQUE
);


CREATE TABLE producto (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    id_comercio INT NOT NULL,
    id_categoria INT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    marca VARCHAR(100),
    precio DECIMAL(10,2) NOT NULL,
    descripcion VARCHAR(255),
    stock INT NOT NULL,
    imagen VARCHAR(255),
    visible BOOLEAN NOT NULL DEFAULT TRUE,
    CHECK (precio >= 0),
    CHECK (stock >= 0),
    FOREIGN KEY (id_comercio) REFERENCES comercio(id_comercio),
    FOREIGN KEY (id_categoria) REFERENCES categoria(id_categoria)
);


-- =========================
-- CARRITO
-- =========================

CREATE TABLE carrito (
    id_carrito INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_persona)
);


CREATE TABLE carrito_producto (
    id_carrito INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    PRIMARY KEY (id_carrito, id_producto),
    CHECK (cantidad > 0),
    FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);


-- =========================
-- PROMOCIONES
-- =========================

CREATE TABLE promocion (
    id_promocion INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(20) NOT NULL,
    CHECK (valor >= 0),
    CHECK (fecha_fin IS NULL OR fecha_inicio IS NULL OR fecha_fin >= fecha_inicio),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);


-- =========================
-- PEDIDOS
-- =========================

CREATE TABLE pedido (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_comercio INT NOT NULL,
    fecha_pedido DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(50) NOT NULL,
    codigo_retiro VARCHAR(20) UNIQUE,
    motivo_cancelacion VARCHAR(255),
    fecha_listo DATETIME,
    vence_retiro DATETIME,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_persona),
    FOREIGN KEY (id_comercio) REFERENCES comercio(id_comercio)
);


CREATE TABLE pedido_producto (
    id_pedido INT NOT NULL,
    id_producto INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (id_pedido, id_producto),
    CHECK (cantidad > 0),
    CHECK (precio_unitario >= 0),
    FOREIGN KEY (id_pedido) REFERENCES pedido(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);


-- =========================
-- FAVORITOS Y SEGUIMIENTO
-- =========================

CREATE TABLE producto_favorito (
    id_cliente INT NOT NULL,
    id_producto INT NOT NULL,
    PRIMARY KEY (id_cliente, id_producto),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_persona),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);


CREATE TABLE comercio_seguido (
    id_cliente INT NOT NULL,
    id_comercio INT NOT NULL,
    PRIMARY KEY (id_cliente, id_comercio),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_persona),
    FOREIGN KEY (id_comercio) REFERENCES comercio(id_comercio)
);


-- =========================
-- COMENTARIOS Y CALIFICACIONES
-- =========================

CREATE TABLE comentario (
    id_comentario INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_producto INT NOT NULL,
    comentario VARCHAR(500) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_persona),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);


CREATE TABLE calificacion (
    id_calificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_producto INT NOT NULL,
    valor INT NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (id_cliente, id_producto),
    CHECK (valor >= 1 AND valor <= 10),
    FOREIGN KEY (id_cliente) REFERENCES cliente(id_persona),
    FOREIGN KEY (id_producto) REFERENCES producto(id_producto)
);


-- =========================
-- NOTIFICACIONES
-- =========================

CREATE TABLE notificacion (
    id_notificacion INT AUTO_INCREMENT PRIMARY KEY,
    id_persona INT NOT NULL,
    mensaje VARCHAR(255) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    leida BOOLEAN NOT NULL DEFAULT FALSE,
    FOREIGN KEY (id_persona) REFERENCES usuario(id_persona)
);


-- =========================
-- HISTORIAL DE STOCK
-- Se guarda el cambio de stock para poder consultar movimientos anteriores.
-- No usamos clave foranea aca para conservar el historial aunque un producto se elimine.
-- =========================

CREATE TABLE movimiento_stock (
    id_movimiento INT AUTO_INCREMENT PRIMARY KEY,
    id_producto INT NOT NULL,
    nombre_producto VARCHAR(100) NOT NULL,
    stock_anterior INT NOT NULL,
    stock_nuevo INT NOT NULL,
    fecha DATETIME NOT NULL
);


-- =========================
-- INDICES
-- Mejoran busquedas que se van a hacer seguido.
-- =========================

CREATE INDEX idx_producto_nombre
ON producto(nombre);

CREATE INDEX idx_producto_precio
ON producto(precio);

CREATE INDEX idx_producto_comercio
ON producto(id_comercio);

CREATE INDEX idx_pedido_estado
ON pedido(estado);

CREATE INDEX idx_pedido_cliente
ON pedido(id_cliente);

CREATE INDEX idx_pedido_comercio
ON pedido(id_comercio);


-- =========================
-- TRIGGER
-- Cuando cambia el stock de un producto se guarda el movimiento.
-- =========================

DELIMITER //

CREATE TRIGGER registrar_movimiento_stock
AFTER UPDATE ON producto
FOR EACH ROW
BEGIN
    IF OLD.stock <> NEW.stock THEN
        INSERT INTO movimiento_stock
        (id_producto, nombre_producto, stock_anterior, stock_nuevo, fecha)
        VALUES
        (NEW.id_producto, NEW.nombre, OLD.stock, NEW.stock, NOW());
    END IF;
END //

DELIMITER ;


-- =========================
-- PROCEDIMIENTO
-- Consulta los productos de un comercio.
-- =========================

DELIMITER //

CREATE PROCEDURE consultar_productos_comercio(
    IN parametro_id_comercio INT
)
BEGIN
    SELECT *
    FROM producto
    WHERE id_comercio = parametro_id_comercio;
END //

DELIMITER ;


-- =========================
-- DATOS DE PRUEBA
-- =========================

INSERT INTO usuario
(id_persona, nombre, cedula, correo, contraseña, fecha_nacimiento)
VALUES
(1, 'Juan Perez', '45678901', 'juan@gmail.com', '1234', '2005-03-15'),
(2, 'Sofia Silva', '50123456', 'sofia@gmail.com', 'sofia123', '2004-12-02'),
(3, 'Valentina Diaz', '52345678', 'valentina@gmail.com', 'vale123', '2005-06-30');


INSERT INTO cliente
(id_persona)
VALUES
(1);


INSERT INTO jefe
(id_persona)
VALUES
(2);


INSERT INTO comercio
(id_comercio, id_jefe, nombre, ruc, telefono, direccion, horario)
VALUES
(1, 2, 'Almacen La Plaza', '219876540019', '099123456', 'Av. Artigas 123', '08:00 - 18:00');


INSERT INTO empleado
(id_persona, id_comercio)
VALUES
(3, 1);


INSERT INTO categoria
(id_categoria, descripcion, nombre)
VALUES
(1, 'Productos de alimentacion', 'Alimentos'),
(2, 'Productos de limpieza para el hogar', 'Limpieza'),
(3, 'Productos electronicos y accesorios', 'Electronica'),
(4, 'Ropa y accesorios personales', 'Ropa');


INSERT INTO producto
(id_producto, id_comercio, id_categoria, nombre, marca, precio, descripcion, stock, imagen, visible)
VALUES
(1, 1, 1, 'Arroz 1kg', 'Marca ejemplo', 65.00, 'Paquete de arroz de 1 kilogramo', 30, NULL, TRUE),
(2, 1, 1, 'Fideos 500g', 'Marca ejemplo', 45.00, 'Paquete de fideos de 500 gramos', 25, NULL, TRUE);


INSERT INTO carrito
(id_carrito, id_cliente, fecha_creacion, estado)
VALUES
(1, 1, '2026-09-01 10:00:00', 'Activo');


INSERT INTO carrito_producto
(id_carrito, id_producto, cantidad)
VALUES
(1, 1, 2);


INSERT INTO promocion
(id_promocion, id_producto, tipo, valor, fecha_inicio, fecha_fin, estado)
VALUES
(1, 1, 'porcentaje', 10.00, '2026-10-01', '2026-10-31', 'Activa');


INSERT INTO pedido
(id_pedido, id_cliente, id_comercio, fecha_pedido, estado, codigo_retiro)
VALUES
(1, 1, 1, '2026-10-07 18:00:00', 'Pendiente', 'TT-A7K4P2');


INSERT INTO pedido_producto
(id_pedido, id_producto, cantidad, precio_unitario)
VALUES
(1, 1, 2, 65.00);


INSERT INTO producto_favorito
(id_cliente, id_producto)
VALUES
(1, 1);


INSERT INTO comercio_seguido
(id_cliente, id_comercio)
VALUES
(1, 1);


INSERT INTO comentario
(id_cliente, id_producto, comentario)
VALUES
(1, 1, 'Buen producto');


INSERT INTO calificacion
(id_cliente, id_producto, valor)
VALUES
(1, 1, 9);


INSERT INTO notificacion
(id_persona, mensaje)
VALUES
(1, 'Tu pedido fue creado correctamente');


-- =========================
-- CONSULTAS DE PRUEBA
-- =========================

SELECT * FROM usuario;
SELECT * FROM cliente;
SELECT * FROM jefe;
SELECT * FROM empleado;
SELECT * FROM comercio;
SELECT * FROM carrito;
SELECT * FROM categoria;
SELECT * FROM producto;
SELECT * FROM carrito_producto;
SELECT * FROM promocion;
SELECT * FROM pedido;
SELECT * FROM pedido_producto;
SELECT * FROM producto_favorito;
SELECT * FROM comercio_seguido;
SELECT * FROM comentario;
SELECT * FROM calificacion;
SELECT * FROM notificacion;
SELECT * FROM movimiento_stock;


-- Productos con su comercio y categoria
SELECT
    p.id_producto,
    p.nombre AS producto,
    p.precio,
    p.stock,
    c.nombre AS comercio,
    ca.nombre AS categoria
FROM producto p
INNER JOIN comercio c ON p.id_comercio = c.id_comercio
INNER JOIN categoria ca ON p.id_categoria = ca.id_categoria;


-- Productos con poco stock
SELECT *
FROM producto
WHERE stock > 0 AND stock <= 5
ORDER BY stock ASC;


-- Cantidad de productos por comercio
SELECT
    c.nombre AS comercio,
    COUNT(p.id_producto) AS cantidad_productos
FROM comercio c
LEFT JOIN producto p ON c.id_comercio = p.id_comercio
GROUP BY c.id_comercio, c.nombre;


-- Comercios que tienen 2 o mas productos
SELECT
    c.nombre AS comercio,
    COUNT(p.id_producto) AS cantidad_productos
FROM comercio c
INNER JOIN producto p ON c.id_comercio = p.id_comercio
GROUP BY c.id_comercio, c.nombre
HAVING COUNT(p.id_producto) >= 2;


-- Total de cada pedido
SELECT
    id_pedido,
    SUM(cantidad * precio_unitario) AS total_pedido
FROM pedido_producto
GROUP BY id_pedido;


-- Pedidos mostrando cliente y comercio
SELECT
    p.id_pedido,
    u.nombre AS cliente,
    c.nombre AS comercio,
    p.fecha_pedido,
    p.estado,
    p.codigo_retiro
FROM pedido p
INNER JOIN usuario u ON p.id_cliente = u.id_persona
INNER JOIN comercio c ON p.id_comercio = c.id_comercio;


-- Promedio de calificacion por producto
SELECT
    p.nombre AS producto,
    AVG(c.valor) AS promedio_calificacion
FROM producto p
LEFT JOIN calificacion c ON p.id_producto = c.id_producto
GROUP BY p.id_producto, p.nombre;


-- =========================
-- COMANDOS SHOW
-- Sirven para revisar lo que se creo en la base.
-- =========================

SHOW DATABASES;
SHOW TABLES;
SHOW COLUMNS FROM producto;
SHOW CREATE TABLE producto;
SHOW INDEX FROM producto;
SHOW TRIGGERS FROM baseplataforma;
SHOW PROCEDURE STATUS WHERE Db = 'baseplataforma';
SHOW CREATE PROCEDURE consultar_productos_comercio;


-- =========================
-- PROBAR EL PROCEDIMIENTO
-- =========================

CALL consultar_productos_comercio(1);


-- =========================
-- EJEMPLO DE TRANSACCION
-- Queda comentado para no cambiar los datos cada vez que se ejecuta el archivo.
-- Al confirmar un pedido se deben guardar todas las operaciones o ninguna.
-- =========================

-- START TRANSACTION;

-- INSERT INTO pedido
-- (id_cliente, id_comercio, estado, codigo_retiro)
-- VALUES
-- (1, 1, 'Pendiente', 'TT-EJEMPLO');

-- INSERT INTO pedido_producto
-- (id_pedido, id_producto, cantidad, precio_unitario)
-- VALUES
-- (LAST_INSERT_ID(), 1, 1, 65.00);

-- UPDATE producto
-- SET stock = stock - 1
-- WHERE id_producto = 1;

-- COMMIT;

-- Si algo falla antes del COMMIT se puede utilizar:
-- ROLLBACK;


-- =========================
-- USUARIOS Y PERMISOS DE MYSQL
-- Se dejan como ejemplo porque cada integrante puede usar una configuracion distinta.
-- No se deben subir contraseñas reales a GitHub.
-- =========================

-- CREATE USER 'todo_tala_api'@'localhost' IDENTIFIED BY 'CAMBIAR_CONTRASEÑA';

-- GRANT SELECT, INSERT, UPDATE, DELETE
-- ON baseplataforma.*
-- TO 'todo_tala_api'@'localhost';

-- SHOW GRANTS FOR 'todo_tala_api'@'localhost';

-- Para quitar permisos:
-- REVOKE SELECT, INSERT, UPDATE, DELETE
-- ON baseplataforma.*
-- FROM 'todo_tala_api'@'localhost';

-- Para eliminar el usuario:
-- DROP USER 'todo_tala_api'@'localhost';
