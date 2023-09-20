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
    stock INT CHECK (precio > 0),
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
    estado VARCHAR(100) DEFAULT 'Pendiente',
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_mesa) REFERENCES Mesa(id_mesa),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente)
);

CREATE TABLE Pedido_Producto (
    id_pedido INT,
    id_producto INT,
    cantidad INT,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE TABLE Factura (
    id_factura SERIAL PRIMARY KEY,
    numero VARCHAR(100) NOT NULL,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    estado_de_pago VARCHAR(100) DEFAULT 'Cancelado',
    id_pedido INT,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
    CONSTRAINT uk_id_pedido UNIQUE (id_pedido)
);


-- Trigger que actualiza el estado de la mesa a "Ocupada"
-- cuando se inserte un nuevo pedido en la tabla Pedido.
CREATE FUNCTION actualizar_estado_mesa()
    RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el estado de la mesa a "Ocupada" solo si no es "Ocupada" actualmente.
    UPDATE Mesa
    SET estado = 'Ocupada'
    WHERE id_mesa = NEW.id_mesa AND estado != 'Ocupada';

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para que se active después de una inserción en la tabla Pedido.
CREATE TRIGGER pedido_insert
AFTER INSERT ON Pedido
FOR EACH ROW
EXECUTE FUNCTION actualizar_estado_mesa();


-- Trigger que actualiza el stock de los productos y genere una alerta
-- cuando se inserte un nuevo registro en la tabla Pedido_Producto.
CREATE OR REPLACE FUNCTION actualizar_stock_producto()
    RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el stock restando la cantidad del pedido.
    UPDATE Producto
    SET stock = stock - NEW.cantidad
    WHERE id_producto = NEW.id_producto
    AND stock >= NEW.cantidad;

    -- Verificar si se realizó la actualización del stock.
    IF FOUND THEN
        RETURN NEW;
    ELSE
        -- Generar una alerta si el stock es menor que 0.
        RAISE EXCEPTION 'Alerta: Stock de producto (%s) es menor que 0', NEW.id_producto;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para que se active después de una inserción en la tabla Pedido_Producto.
CREATE TRIGGER pedido_producto_insert
AFTER INSERT ON Pedido_Producto
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock_producto();


CREATE OR REPLACE FUNCTION calcular_total_factura()
    RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el campo "total" en la tabla Factura basado en la sumatoria de los productos en Pedido_Producto.
    UPDATE Factura
    SET total = (
        SELECT SUM(precio * cantidad)
        FROM Producto
        JOIN Pedido_Producto ON Producto.id_producto = Pedido_Producto.id_producto
        WHERE Pedido_Producto.id_pedido = NEW.id_pedido
    ),
    estado_de_pago = 'Cancelado' -- Establecer el estado_de_pago en 'Cancelado'
    WHERE id_factura = NEW.id_factura;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para que se active después de una inserción en la tabla Factura.
CREATE TRIGGER calcular_total_factura_trigger
AFTER INSERT ON Factura
FOR EACH ROW
EXECUTE FUNCTION calcular_total_factura();


DROP TRIGGER IF EXISTS pedido_insert ON Pedido;

CREATE OR REPLACE FUNCTION marcar_mesa_como_ocupada()
    RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el estado de la mesa a "ocupada" solo si no es "ocupada" actualmente.
    IF NEW.estado != 'ocupada' THEN
        UPDATE Mesa
        SET estado = 'ocupada'
        WHERE id_mesa = NEW.id_mesa;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para que se active después de una inserción en la tabla Pedido.
CREATE TRIGGER pedido_insert
AFTER INSERT ON Pedido
FOR EACH ROW
EXECUTE FUNCTION marcar_mesa_como_ocupada();


-- Crear un trigger que cambie el estado del pedido a 'Cancelado' cuando se genere una factura.
CREATE OR REPLACE FUNCTION generar_factura()
    RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el estado del pedido a 'Cancelado' y el estado_de_pago a 'Cancelado' en la factura.
    UPDATE Pedido
    SET estado = 'Cancelado'
    WHERE id_pedido = NEW.id_pedido;

    -- Actualizar el estado_de_pago a 'Cancelado' en la factura.
    UPDATE Factura
    SET estado_de_pago = 'Cancelado'
    WHERE id_factura = NEW.id_factura;

    -- Actualizar el estado de la mesa a 'Disponible'.
    UPDATE Mesa
    SET estado = 'Disponible'
    WHERE id_mesa = (
        SELECT id_mesa
        FROM Pedido
        WHERE id_pedido = NEW.id_pedido
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Crear el trigger para que se active después de una inserción en la tabla Factura.
CREATE TRIGGER factura_insert
AFTER INSERT ON Factura
FOR EACH ROW
EXECUTE FUNCTION generar_factura();



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
(2, 6, 'Disponible'),
(3, 2, 'Disponible'),
(4, 8, 'Disponible'),
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
('Huevos Revueltos', 25, 6.99, '00:08:00', 'Disponible', 5),
('Tigrillo', 20, 5.00, '00:10:00', 'Disponible', 5);

-- Registros para la tabla Pedido con hora específica.
-- Los registros no serán necesarios gracias a la función CURRENT_TIMESTAMP
INSERT INTO Pedido (num_pedido, id_usuario, id_mesa, id_cliente) VALUES
(1, 1, 1, 1),
(2, 2, 2, 2);

-- Registros para la tabla Pedido_Producto
INSERT INTO Pedido_Producto (id_pedido, id_producto) VALUES
(1, 1),
(1, 2),
(2, 4);
