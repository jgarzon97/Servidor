const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'baserestaurante',
    port: 5432
});

// Función que devuelve todos los registros de la Tabla Pedido
async function getPedidos(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Pedido');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

// Función que devuelve un Pedido por id
async function getPedido(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM Pedido WHERE id_pedido = $1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.status(200);
        if (result.rowCount > 0) {
            res.json(result.rows);
        } else {
            res.status(500).json({ message: 'No existe el pedido' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

// Crea un pedido
async function createPedido(req, res) {
    const { num_pedido, id_usuario, id_mesa, id_cliente } = req.body;
    const query = 'INSERT INTO Pedido (num_pedido, id_usuario, id_mesa, id_cliente) VALUES ($1, $2, $3, $4)';
    const values = [num_pedido, id_usuario, id_mesa, id_cliente];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Se guardó con éxito el pedido' });
        } else {
            res.status(400).json({ message: 'No se guardó el pedido' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getUsuarios(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Usuario');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function createUsuario(req, res) {
    const { user_usuario, pass_usuario, nombre_user, apellido_user, id_rol } = req.body;
    const query = 'INSERT INTO Usuario (user_usuario, pass_usuario, nombre_user, apellido_user, id_rol) VALUES ($1, $2, $3, $4, $5)';
    const values = [user_usuario, pass_usuario, nombre_user, apellido_user, id_rol];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Se guardó con éxito el usuario' });
        } else {
            res.status(400).json({ message: 'No se guardó el usuario' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

const bcrypt = require('bcrypt');

async function autenticarUsuario(req, res) {
    try {
        const { usuario, password } = req.body;

        // Realizar una consulta SQL para obtener la contraseña almacenada en la base de datos
        const query = 'SELECT * FROM Usuario WHERE user_usuario = $1';
        const result = await pool.query(query, [usuario]);

        // Verificar si se encontró un usuario con ese nombre de usuario
        if (result.rows.length === 1) {
            const user = result.rows[0];

            // Verificar la contraseña utilizando bcrypt
            bcrypt.compare(password, user.pass_usuario, (err, passwordMatch) => {
                if (err) {
                    // Error en la comparación de contraseñas
                    res.status(500).json({ error: 'Error en el servidor', detalle: err.message });
                } else if (passwordMatch) {
                    // Usuario autenticado con éxito
                    res.status(200).json({ mensaje: 'Autenticación exitosa', usuario: user });
                } else {
                    // Credenciales incorrectas
                    res.status(401).json({ error: 'Credenciales incorrectas' });
                }
            });
        } else {
            // Usuario no encontrado
            res.status(401).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error al autenticar usuario:', error);
        res.status(500).json({ error: 'Error en el servidor', detalle: error.message });
    }
}


async function getCategorias(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Categoria');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getProductos(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Producto');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function createProducto(req, res) {
    const { nombre, stock, precio, tiempo, estado, id_categoria } = req.body;
    const query = 'INSERT INTO Producto (nombre, stock, precio, tiempo, estado, id_categoria) VALUES ($1, $2, $3, $4, $5, $6)';
    const values = [nombre, stock, precio, tiempo, estado, id_categoria];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Se guardó con éxito el producto' });
        } else {
            res.status(400).json({ message: 'No se guardó el producto' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getMesas(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Mesa');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener las mesas:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getFactura(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Factura');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener las facturas:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function createFactura(req, res) {
    const { numero, id_pedido } = req.body;
    const query = 'INSERT INTO Factura (numero, id_pedido) VALUES ($1, $2)';
    const values = [numero, id_pedido];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Se guardó con éxito la factura' });
        } else {
            res.status(400).json({ message: 'No se guardó el factura' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getClientes(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Cliente');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los clientes:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function createPedido_Producto(req, res) {
    const { id_pedido, id_producto, cantidad } = req.body;
    const query = 'INSERT INTO pedido_producto (id_pedido, id_producto, cantidad) VALUES ($1, $2, $3)';
    const values = [id_pedido, id_producto, cantidad];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Se guardaron los detalles del Pedido' });
        } else {
            res.status(400).json({ message: 'No se guardaron los detalles del Pedido' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}


module.exports = {
    // Pedido
    getPedido,
    getPedidos,
    createPedido,
    // Usuario
    getUsuarios,
    createUsuario,
    autenticarUsuario,
    // Categoria
    getCategorias,
    // Mesa
    getMesas,
    // Factura
    getFactura,
    createFactura,
    // Cliente
    getClientes,
    // Producto
    getProductos,
    createProducto,
    // Pedido_Producto
    createPedido_Producto
};
