const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'baserestaurante',
    port: 5432
});

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

async function obtenerIdPorNombre(req, res) {
    const { nombre } = req.params;
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id_producto FROM Producto WHERE nombre = $1', [nombre]);
        client.release();

        if (result.rows.length > 0) {
            res.json(result.rows[0].id_producto);
        } else {
            res.status(404).json({ error: "Producto no encontrado" });
        }
    } catch (error) {
        console.error('Error al obtener el ID del producto por nombre:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}


async function getNameProductos(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT id_producto, nombre FROM Producto;');
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
        const result = await client.query('SELECT * FROM vista_productos');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los productos:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getVistaProductos(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Vista_productos');
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

module.exports = {
    getProducto,
    obtenerIdPorNombre,
    getProductos,
    getNameProductos,
    getVistaProductos,
    createProducto
};