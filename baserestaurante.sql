CREATE DATABASE baserestaurante;

-- \c baserestaurante

CREATE TABLE Rol (
    id_rol SERIAL PRIMARY KEY,
    tipo_rol VARCHAR(100),
    detalles_rol TEXT
);

CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    user_usuario VARCHAR(100) NOT NULL,
    pass_usuario VARCHAR(100) NOT NULL,
    nombre_user VARCHAR(100),
    apellido_user VARCHAR(100),
    id_rol INT,
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
);

CREATE TABLE Mesa (
    id_mesa SERIAL PRIMARY KEY,
    num_mesa INT NOT NULL,
    capacidad INT,
    estado VARCHAR(100)
);

CREATE TABLE Cliente (
    id_cliente SERIAL PRIMARY KEY,
    cedula VARCHAR(10) NOT NULL,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    direccion TEXT
);

CREATE TABLE Categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estado VARCHAR(100)
);

CREATE TABLE Producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    stock INT,
    precio DECIMAL(10, 2),
    tiempo TIME,
    estado VARCHAR(100),
    id_categoria INT,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
);

CREATE TABLE Pedido (
    id_pedido SERIAL PRIMARY KEY,
    num_pedido INT NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hora TIME DEFAULT CURRENT_TIMESTAMP,
    id_usuario INT,
    id_mesa INT,
    id_cliente INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_mesa) REFERENCES Mesa(id_mesa),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE Pedido_Producto (
    id_pedido_producto SERIAL PRIMARY KEY,
    id_pedido INT,
    id_producto INT,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE TABLE Factura (
    id_factura SERIAL PRIMARY KEY,
    numero VARCHAR(100) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    estado_de_pago VARCHAR(100),
    id_pedido INT,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido)
);

-- FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION liberar_mesa_y_crear_factura()
RETURNS TRIGGER AS $$
DECLARE
    mesa_id INT;
BEGIN
    -- Obtener el ID de la mesa asociada al pedido
    SELECT id_mesa INTO mesa_id FROM Pedido WHERE id_pedido = NEW.id_pedido;

    -- Actualizar el estado de la mesa a "Disponible"
    UPDATE Mesa SET estado = 'Disponible' WHERE id_mesa = mesa_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER PARA LIBERAR LA MESA LUEGO DELA FACTURA
CREATE TRIGGER tr_generar_factura
AFTER INSERT ON Factura
FOR EACH ROW
EXECUTE FUNCTION liberar_mesa_y_crear_factura();

-- FUNCION PARA MARCAR OCUPADA UNA MESA
CREATE OR REPLACE FUNCTION marcar_mesa_como_ocupada()
RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el estado de la mesa a "ocupada"
    UPDATE Mesa SET estado = 'Ocupada' WHERE id_mesa = NEW.id_mesa;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- TRIGGER PARA MARCAR OCUPADA UNA MESA LUEGO DE UN PEDIDO
CREATE TRIGGER tr_mesa_ocupada
AFTER INSERT ON Pedido
FOR EACH ROW
EXECUTE FUNCTION marcar_mesa_como_ocupada();

-- INSERTS

-- Roles para el sistema
INSERT INTO Rol (tipo_rol, detalles_rol) VALUES
('administrador', 'Rol con permisos de administrador.'),
('camarero', 'Rol para el personal de servicio de mesas.');

-- Usuario con rol "admin"
INSERT INTO Usuario (user_usuario, pass_usuario, nombre_user, apellido_user, id_rol) VALUES
('admin', 'admin123', 'Jorge', 'Garzón', 1);

-- Usuarios con rol "camarero"
INSERT INTO Usuario (user_usuario, pass_usuario, nombre_user, apellido_user, id_rol) VALUES
('camarero1', 'contraseña1', 'Nayelhy', 'Ponce', 2),
('camarero2', 'contraseña2', 'Doamel', 'Navarrete', 2),
('camarero3', 'contraseña3', 'Jarod', 'Mendoza', 2),
('camarero4', 'contraseña4', 'Stalin', 'Cajamarca', 2);

-- Ingreso de Mesas
INSERT INTO Mesa (num_mesa, capacidad, estado) VALUES
(1, 4, 'Disponible'),
(2, 6, 'Ocupada'),
(3, 2, 'Disponible'),
(4, 8, 'Reservada'),
(5, 4, 'Disponible');

-- Ingreso de Clientes
INSERT INTO Cliente (cedula, nombre, apellido, direccion) VALUES
('0123456789', 'Juan', 'Pérez', 'Calle 123, Ciudad A'),
('0123456790', 'María', 'Gómez', 'Avenida XYZ, Ciudad B'),
('0123456791', 'Pedro', 'López', 'Carrera 456, Ciudad C'),
('0123456792', 'Laura', 'Martínez', 'Calle 789, Ciudad D'),
('0123456793', 'Carlos', 'Rodríguez', 'Avenida ABC, Ciudad E'),
('0123456794', 'Ana', 'Sánchez', 'Calle 222, Ciudad F'),
('0123456795', 'Luis', 'García', 'Avenida UVW, Ciudad G'),
('0123456796', 'Isabel', 'Díaz', 'Carrera 333, Ciudad H'),
('0123456797', 'Javier', 'Hernández', 'Calle 555, Ciudad I'),
('0123456798', 'Elena', 'Fernández', 'Avenida DEF, Ciudad J');

-- Ingreso de Categorias
INSERT INTO Categoria (nombre, estado) VALUES
('Entradas', 'Activa'),
('Platos Principales', 'Activa'),
('Bebidas', 'Activa'),
('Postres', 'Activa'),
('Desayuno', 'Activa');

-- Productos en la categoría "Entradas"
INSERT INTO Producto (nombre, stock, precio, tiempo, estado, id_categoria) VALUES
('Ensalada César', 20, 8.99, '00:15:00', 'Disponible', 1),
('Aros de Cebolla', 30, 5.99, '00:10:00', 'Disponible', 1),
('Sopa de Tomate', 15, 6.49, '00:12:00', 'Disponible', 1);

-- Productos en la categoría "Platos Principales"
INSERT INTO Producto (nombre, stock, precio, tiempo, estado, id_categoria) VALUES
('Filete de Salmón', 25, 15.99, '00:20:00', 'Disponible', 2),
('Pollo al Curry', 20, 12.49, '00:18:00', 'Disponible', 2),
('Lasagna', 18, 10.99, '00:25:00', 'Disponible', 2);

-- Productos en la categoría "Bebidas"
INSERT INTO Producto (nombre, stock, precio, tiempo, estado, id_categoria) VALUES
('Agua Mineral', 50, 1.99, '00:02:00', 'Disponible', 3),
('Refresco de Cola', 40, 2.49, '00:03:00', 'Disponible', 3),
('Cerveza Artesanal', 30, 4.99, '00:05:00', 'Disponible', 3);

-- Productos en la categoría "Postres"
INSERT INTO Producto (nombre, stock, precio, tiempo, estado, id_categoria) VALUES
('Tarta de Manzana', 15, 5.99, '00:10:00', 'Disponible', 4),
('Helado de Chocolate', 20, 3.49, '00:08:00', 'Disponible', 4),
('Brownie con Helado', 12, 6.99, '00:12:00', 'Disponible', 4);

-- Productos en la categoría "Desayuno"
INSERT INTO Producto (nombre, stock, precio, tiempo, estado, id_categoria) VALUES
('Café Espresso', 40, 2.99, '00:02:00', 'Disponible', 5),
('Tostadas con Mermelada', 30, 4.49, '00:05:00', 'Disponible', 5),
('Huevos Revueltos', 25, 6.99, '00:08:00', 'Disponible', 5);
('Tigrillo', 20, 5.00, '00:10:00', 'Disponible', 5);

-- Registros para la tabla Pedido con hora específica.
-- Los registros no serán necesarios gracias a la función CURRENT_TIMESTAMP
INSERT INTO Pedido (num_pedido, fecha, hora, id_usuario, id_mesa, id_cliente) VALUES
(1, '2023-09-09', '12:30:00', 1, 1, 1),
(2, '2023-09-09', '13:15:00', 2, 2, 2),
(3, '2023-09-09', '14:00:00', 3, 3, 3),
(4, '2023-09-10', '18:45:00', 1, 4, 4),
(5, '2023-09-10', '19:30:00', 2, 5, 5);

-- Registros para la tabla Pedido_Producto
INSERT INTO Pedido_Producto (id_pedido, id_producto) VALUES
(1, 1),
(1, 2),
(2, 4),
(3, 6),
(4, 8),
(5, 10),
(1, 3),
(2, 5),
(3, 6),
(4, 7);
