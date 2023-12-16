CREATE DATABASE baserestaurante;

-- \c baserestaurante

CREATE TABLE Rol (
    id_rol SERIAL PRIMARY KEY,
    tipo_rol VARCHAR(100),
    detalles_rol TEXT,
    estado VARCHAR(25) DEFAULT 'Activo'
);

CREATE TABLE Usuario (
    id_usuario SERIAL PRIMARY KEY,
    user_usuario VARCHAR(100) NOT NULL,
    pass_usuario VARCHAR(100) NOT NULL,
    nombre_user VARCHAR(100),
    apellido_user VARCHAR(100),
    estado VARCHAR(25) DEFAULT 'Activo',
    id_rol INT,
    FOREIGN KEY (id_rol) REFERENCES Rol(id_rol)
);

CREATE TABLE Mesa (
    id_mesa SERIAL PRIMARY KEY,
    num_mesa INT NOT NULL,
    capacidad INT,
    estado VARCHAR(25) DEFAULT 'Disponible'
);

CREATE TABLE Cliente (
    id_cliente SERIAL PRIMARY KEY,
    cedula VARCHAR(10) NOT NULL,
    nombre VARCHAR(100),
    apellido VARCHAR(100),
    direccion TEXT,
    email VARCHAR(100),
    telefono VARCHAR(10)
);

CREATE TABLE Categoria (
    id_categoria SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    estado VARCHAR(25) DEFAULT 'Activo'
);

CREATE TABLE Producto (
    id_producto SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    stock INT CHECK (precio > 0),
    precio DECIMAL(10, 2),
    tiempo TIME,
    estado VARCHAR(25) DEFAULT 'Disponible',
    id_categoria INT,
    FOREIGN KEY (id_categoria) REFERENCES Categoria(id_categoria)
);

CREATE TABLE Pedido (
    id_pedido SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    hora TIME DEFAULT CURRENT_TIMESTAMP,
    estado VARCHAR(25) DEFAULT 'Pendiente',
    id_usuario INT,
    id_mesa INT,
    FOREIGN KEY (id_usuario) REFERENCES Usuario(id_usuario),
    FOREIGN KEY (id_mesa) REFERENCES Mesa(id_mesa)
);

CREATE TABLE Pedido_Producto (
    id_pedido INT,
    id_producto INT,
    cantidad INT,
    detalle TEXT,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
    FOREIGN KEY (id_producto) REFERENCES Producto(id_producto)
);

CREATE TABLE Factura (
    id_factura SERIAL PRIMARY KEY,
    fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    total DECIMAL(10, 2),
    estado_de_pago VARCHAR(25) DEFAULT 'Cancelado',
    id_pedido INT,
    id_cliente INT,
    FOREIGN KEY (id_pedido) REFERENCES Pedido(id_pedido),
    FOREIGN KEY (id_cliente) REFERENCES Cliente(id_cliente),
    CONSTRAINT uk_id_pedido UNIQUE (id_pedido)
);

-- Trigger que actualiza el stock de los productos
CREATE OR REPLACE FUNCTION actualizar_stock_producto()
RETURNS TRIGGER AS $$
DECLARE
    stock_actual INTEGER;
BEGIN
    -- Obtener el stock actual del producto.
    SELECT stock INTO stock_actual
    FROM Producto
    WHERE id_producto = NEW.id_producto;

    -- Actualizar el stock restando la cantidad del pedido.
    UPDATE Producto
    SET stock = stock_actual - NEW.cantidad
    WHERE id_producto = NEW.id_producto
    AND stock_actual >= NEW.cantidad;

    -- Si el stock llega a 0 o es menor que 0, actualizar el estado a 'Agotado'.
    IF stock_actual - NEW.cantidad <= 0 THEN
        UPDATE Producto
        SET estado = 'Agotado'
        WHERE id_producto = NEW.id_producto;
    END IF;

    RETURN NEW;
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


CREATE OR REPLACE FUNCTION marcar_mesa_como_ocupada()
    RETURNS TRIGGER AS $$
BEGIN
    -- Actualizar el estado de la mesa a "ocupada" solo si no es "ocupada" actualmente.
    IF NEW.estado != 'Ocupada' THEN
        UPDATE Mesa
        SET estado = 'Ocupada'
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

-- Trigger para que se active después de una inserción en la tabla Factura.
CREATE TRIGGER factura_insert
AFTER INSERT ON Factura
FOR EACH ROW
EXECUTE FUNCTION generar_factura();


CREATE OR REPLACE FUNCTION liberar_mesa_despues_de_eliminar()
RETURNS TRIGGER AS $$
DECLARE
    id_mesa_libre INT;
BEGIN
    -- Obtener el ID de la mesa del registro eliminado
    id_mesa_libre := old.id_mesa;

    -- Actualizar el estado de la mesa a "Disponible"
    UPDATE Mesa
    SET estado = 'Disponible'
    WHERE id_mesa = id_mesa_libre;

    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_liberar_mesa_despues_de_eliminar
AFTER DELETE ON Pedido
FOR EACH ROW
EXECUTE FUNCTION liberar_mesa_despues_de_eliminar();


CREATE OR REPLACE FUNCTION ajustar_fecha_y_hora()
RETURNS TRIGGER AS $$
BEGIN
    -- Ajustar el campo fecha para contener solo día, mes y año
    NEW.fecha = TO_CHAR(NEW.fecha, 'YYYY-MM-DD');

    -- Ajustar el campo hora para contener solo hora y minutos
    NEW.hora = TO_CHAR(NEW.hora, 'HH24:MI');

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_ajustar_fecha_y_hora
BEFORE INSERT OR UPDATE ON Pedido
FOR EACH ROW
EXECUTE FUNCTION ajustar_fecha_y_hora();


-- Función para eliminar el Pedido y sus detalles
CREATE OR REPLACE FUNCTION eliminar_pedido_producto()
RETURNS TRIGGER AS $$
BEGIN
    DELETE FROM Pedido_Producto WHERE id_pedido = OLD.id_pedido;
    RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Trigger para que se active luego de eliminar un Pedido
CREATE TRIGGER tr_eliminar_pedido_producto
BEFORE DELETE ON Pedido
FOR EACH ROW
EXECUTE FUNCTION eliminar_pedido_producto();

-- Trigger para controlar el stock de productos al hacer pedidos.
CREATE OR REPLACE FUNCTION controlar_stock_producto()
RETURNS TRIGGER AS $$
DECLARE
    stock_actual INT;
BEGIN
    -- Verificar si el stock actual es mayor o igual a la cantidad solicitada en el pedido.
    IF NEW.cantidad > 0 THEN
        -- Verificar el stock actual del producto.
        SELECT stock INTO stock_actual
        FROM Producto
        WHERE id_producto = NEW.id_producto;

        -- Si el stock es menor que la cantidad solicitada, lanzar una excepción.
        IF NEW.cantidad > stock_actual THEN
            RAISE EXCEPTION 'No hay suficiente stock disponible para el producto %s', NEW.id_producto;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para ejecutar la función al insertar registros en Pedido_Producto.
CREATE TRIGGER controlar_stock_trigger
BEFORE INSERT ON Pedido_Producto
FOR EACH ROW
EXECUTE FUNCTION controlar_stock_producto();


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
('nponce', '1111', 'Nayelhy', 'Ponce', 2),
('dnavarrete', '2222', 'Doamel', 'Navarrete', 2),
('scajamarca', '3333', 'Stalin', 'Cajamarca', 2);

-- Ingreso de Mesas
INSERT INTO Mesa (num_mesa, capacidad) VALUES
(1, 4),
(2, 6),
(3, 2),
(4, 8),
(5, 4),
(6, 2),
(7, 4);

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
INSERT INTO Categoria (nombre) VALUES
('Hamburguesa'),
('Pizzas'),
('Sandwich'),
('Hot Dog'),
('Bebidas');

-- Productos en la categoría "Hamburguesa"
INSERT INTO Producto (nombre, stock, precio, tiempo, id_categoria) VALUES
('Hamburguesa simple', 20, 2.50, '00:15:00', 1),
('Hamburguesa completa', 20, 4.50, '00:10:00', 1),
('Hamburguesa vegana', 20, 3, '00:12:00', 1),
('Hamburguesa con papas', 20, 4.25, '00:12:00', 1);

-- Productos en la categoría "Pizza"
INSERT INTO Producto (nombre, stock, precio, tiempo, id_categoria) VALUES
('Pizza simple', 20, 7, '00:20:00', 2),
('Pizza completa', 20, 15.50, '00:18:00', 2),
('Pizza con jamon', 20, 10, '00:25:00', 2),
('Pizza 4 quesos', 20, 20, '00:25:00', 2);

-- Productos en la categoría "Sandwich"
INSERT INTO Producto (nombre, stock, precio, tiempo, id_categoria) VALUES
('Sandwich simple', 20, 1.50, '00:02:00', 3),
('Sandwich completa', 20, 5.50, '00:03:00', 3),
('Sandwich con queso', 20, 3, '00:05:00', 3),
('Sandwich con papas', 20, 4, '00:05:00', 3);

-- Productos en la categoría "Hot dog"
INSERT INTO Producto (nombre, stock, precio, tiempo, id_categoria) VALUES
('Hot dog simple', 20, 5.99, '00:10:00', 4),
('Hot dog completa', 20, 3.49, '00:08:00', 4),
('Hot dog con jamon', 20, 6.99, '00:12:00', 4);

-- Productos en la categoría "Bebidas"
INSERT INTO Producto (nombre, stock, precio, tiempo, id_categoria) VALUES
('Cerveza rubia', 30, 2.99, '00:02:00', 5),
('Cerveza con miel', 30, 3.25, '00:02:00', 5),
('Cerveza con trigo', 30, 2.99, '00:02:00', 5),
('Cerveza negra', 30, 3.50, '00:02:00', 5);

-- Registros para la tabla Pedido con hora específica.
-- Los registros no serán necesarios gracias a la función CURRENT_TIMESTAMP
INSERT INTO Pedido (num_pedido, id_usuario, id_mesa) VALUES
(1, 1, 1),
(2, 2, 2);

-- Registros para la tabla Pedido_Producto
INSERT INTO Pedido_Producto (id_pedido, id_producto) VALUES
(1, 1),
(1, 2),
(2, 4);

-- Vista que muestre el campo "tipo_rol" en lugar de "id_rol".
CREATE OR REPLACE VIEW vista_usuarios AS
SELECT
    U.id_usuario,
    U.user_usuario,
    U.nombre_user,
    U.apellido_user,
    R.tipo_rol,
    U.estado
FROM Usuario U
JOIN Rol R ON U.id_rol = R.id_rol;

-- Vista que muestra el nombre de la categoría en lugar del ID de categoría.
CREATE OR REPLACE VIEW vista_productos AS
SELECT
    P.id_producto,
    P.nombre,
    P.stock,
    P.precio,
    P.tiempo,
    P.estado,
    C.nombre AS nombre_categoria
FROM Producto P
JOIN Categoria C ON P.id_categoria = C.id_categoria;

CREATE OR REPLACE VIEW vista_factura AS
SELECT f.id_factura, f.fecha, f.total, f.estado_de_pago, f.id_pedido, c.nombre, c.apellido
FROM Factura f
JOIN Cliente c ON f.id_cliente = c.id_cliente;


-- PROCESO ALMACENADO PARA obtener_pedidos
CREATE OR REPLACE FUNCTION obtener_pedidos(id_usuario_param integer)
RETURNS TABLE (
    id_pedido integer,
    fecha timestamp without time zone,
    hora time,
    id_usuario integer,
    id_mesa integer,
    estado character varying(100)
)
AS $$
BEGIN
    -- Verificar el rol del usuario
    DECLARE
        rol_usuario text;
    BEGIN
        SELECT r.tipo_rol INTO rol_usuario
        FROM Usuario u
        JOIN Rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = id_usuario_param;
        -- Si el rol es "camarero", filtrar por id_usuario
        IF rol_usuario = 'camarero' THEN
            RETURN QUERY
                SELECT p.*
                FROM Pedido p
                WHERE p.id_usuario = id_usuario_param;
        ELSE
            -- Si el rol es "administrador", mostrar todos los pedidos
            RETURN QUERY
                SELECT p.*
                FROM Pedido p;
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;


-- PROCESO ALMACENADO PARA obtener_factura
CREATE OR REPLACE FUNCTION obtener_factura(id_usuario_param integer)
RETURNS TABLE (
    id_factura integer,
    fecha date,
    total numeric(10, 2),
    estado_de_pago text,
    id_pedido integer,
    id_cliente integer
)
AS $$
BEGIN
    -- Verificar el rol del usuario
    DECLARE
        rol_usuario text;
    BEGIN
        SELECT r.tipo_rol INTO rol_usuario
        FROM Usuario u
        JOIN Rol r ON u.id_rol = r.id_rol
        WHERE u.id_usuario = id_usuario_param;
        -- Si el rol es "camarero", filtrar por id_usuario en la subconsulta
        IF rol_usuario = 'camarero' THEN
            RETURN QUERY
                SELECT f.*
                FROM Factura f
                JOIN Pedido p ON f.id_pedido = p.id_pedido
                WHERE p.id_usuario = id_usuario_param;
        ELSE
            -- Si el rol es "administrador", mostrar todas las facturas
            RETURN QUERY
                SELECT * FROM Factura;
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;

-- FUNCION PARA INGRESAR Nombre EN LUGAR DEL ID_Producto
CREATE OR REPLACE FUNCTION insertar_producto_en_pedido(
    id_pedido_param integer,
    nombre_producto_param text,
    cantidad_param integer,
    detalle_param text
)
RETURNS void
AS $$
BEGIN
    -- Buscar el id_producto basado en el nombre del producto
    DECLARE
        producto_id integer;
    BEGIN
        SELECT id_producto INTO producto_id
        FROM Producto
        WHERE nombre = nombre_producto_param;
        -- Verificar si se encontró un producto con el nombre dado
        IF producto_id IS NOT NULL THEN
            -- Insertar en la tabla pedido_producto
            INSERT INTO pedido_producto (id_pedido, id_producto, cantidad, detalle)
            VALUES (id_pedido_param, producto_id, cantidad_param, detalle_param);
        ELSE
            -- Realizar alguna acción en caso de que no se encuentre el producto
            RAISE EXCEPTION 'El producto con nombre % no existe', nombre_producto_param;
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION insertar_cliente_en_factura(
    id_pedido_param integer,
    cedula_cliente_param text
)
RETURNS void
AS $$
BEGIN
    -- Buscar el id_cliente basado en la cédula del cliente
    DECLARE
        cliente_id integer;
    BEGIN
        SELECT id_cliente INTO cliente_id
        FROM Cliente
        WHERE cedula = cedula_cliente_param;
        -- Verificar si se encontró un cliente con la cédula dada
        IF cliente_id IS NOT NULL THEN
            -- Insertar en la tabla factura
            INSERT INTO factura (id_pedido, id_cliente)
            VALUES (id_pedido_param, cliente_id);
        ELSE
            -- Realizar alguna acción en caso de que no se encuentre el cliente
            RAISE EXCEPTION 'El cliente con cédula % no existe', cedula_cliente_param;
        END IF;
    END;
END;
$$ LANGUAGE plpgsql;
