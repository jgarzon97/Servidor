const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'baserestaurante',
    port: 5432
});

//#region Pedido
async function getPedidos(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Vista_Pedido');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los pedidos:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

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

//#endregion

//#region Usuario

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

async function getUsuario(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM Usuario WHERE id_usuario = $1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.status(200);
        if (result.rowCount > 0) {
            res.json(result.rows);
        } else {
            res.status(500).json({ message: 'No existe el usuario' });
        }
    } catch (err) {
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

//#endregion

//#region Categoria

async function getCategoria(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM Categoria WHERE id_categoria = $1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.status(200);
        if (result.rowCount > 0) {
            res.json(result.rows);
        } else {
            res.status(500).json({ message: 'No existe la categoria' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getCategorias(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Categoria');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener las categorias:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function createCategoria(req, res) {
    const { nombre, estado } = req.body;
    const query = 'INSERT INTO Categoria (nombre, estado) VALUES ($1, $2)';
    const values = [nombre, estado];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Registro exitoso' });
        } else {
            res.status(400).json({ message: 'No se guardó la Categoría' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

//#endregion

//#region Producto

async function getProducto(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM Producto WHERE id_producto = $1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.status(200);
        if (result.rowCount > 0) {
            res.json(result.rows);
        } else {
            res.status(500).json({ message: 'No existe el producto' });
        }
    } catch (err) {
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

//#endregion

//#region Mesa

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


async function getMesa(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM Mesa WHERE id_mesa = $1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.status(200);
        if (result.rowCount > 0) {
            res.json(result.rows);
        } else {
            res.status(500).json({ message: 'No existe la mesa' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function createMesa(req, res) {
    const { num_mesa, capacidad, estado } = req.body;
    const query = 'INSERT INTO Mesa (num_mesa, capacidad, estado) VALUES ($1, $2, $3)';
    const values = [num_mesa, capacidad, estado];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Se guardó con éxito la mesa' });
        } else {
            res.status(400).json({ message: 'No se guardó la mesa' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

//#endregion

//#region Factura

async function getFactura(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM Factura WHERE id_factura = $1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.status(200);
        if (result.rowCount > 0) {
            res.json(result.rows);
        } else {
            res.status(500).json({ message: 'No existe el registro' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getFacturas(req, res) {
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

//#endregion

//#region Cliente

async function getCliente(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM Cliente WHERE id_cliente = $1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.status(200);
        if (result.rowCount > 0) {
            res.json(result.rows);
        } else {
            res.status(500).json({ message: 'No existe el cliente' });
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
        console.error('Error al obtener los registros:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}


async function createCliente(req, res) {
    const { cedula, nombre, apellidp, direccion } = req.body;
    const query = 'INSERT INTO Cliente (cedula, nombre, apellidp, direccion) VALUES ($1, $2, $3, $4)';
    const values = [cedula, nombre, apellidp, direccion];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Registro exitoso' });
        } else {
            res.status(400).json({ message: 'No se guardaro el cliente' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

//#endregion

//#region Pedido_Producto

async function getPedido_Producto(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM Pedido_Producto WHERE id_pedido = $1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.status(200);
        if (result.rowCount > 0) {
            res.json(result.rows);
        } else {
            res.status(500).json({ message: 'No existe el registro en la Tabla' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getPedido_Productos(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Pedido_Producto');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los registros:', error);
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

//#endregion

module.exports = {
    // Pedido
    getPedido,
    getPedidos,
    createPedido,
    // Usuario
    getUsuario,
    getUsuarios,
    createUsuario,
    // Categoria
    getCategoria,
    getCategorias,
    createCategoria,
    // Mesa
    getMesa,
    getMesas,
    createMesa,
    // Factura
    getFactura,
    getFacturas,
    createFactura,
    // Cliente
    getCliente,
    getClientes,
    createCliente,
    // Producto
    getProducto,
    getProductos,
    createProducto,
    // Pedido_Producto
    getPedido_Producto,
    getPedido_Productos,
    createPedido_Producto
};
