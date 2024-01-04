const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'baserestaurante',
    port: 5432
});

//#region Factura

async function getFactura(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM vista_factura WHERE id_factura = $1'
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
        const result = await client.query('SELECT * FROM vista_factura');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener las facturas:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function createFactura(req, res) {
    const { id_pedido, id_cliente } = req.body;
    const query = 'INSERT INTO Factura (id_pedido, id_cliente) VALUES ($1, $2)';
    const values = [id_pedido, id_cliente];
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


async function updateFactura(req, res) {
    const { total, estado_de_pago, id_pedido, id_cliente } = req.params;
    const { id_factura } = req.body;
    const query = 'UPDATE Pedido SET id_factura=$5 WHERE total=$1, estado_de_pago=$2, id_pedido=$3, id_cliente=$4';
    const values = [total, estado_de_pago, id_pedido, id_cliente, id_factura];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Se actualizó Factura' });
        } else {
            res.status(400).json({ message: 'No se actualizó' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getUsuarioFactura(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM obtener_factura($1)';
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json(result.rows); // Devuelve todos los resultados
        } else {
            res.status(404).json({ message: 'No se encontró el usuario' });
        }
    } catch (err) {
        console.error('Error al obtener el usuario:', err);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

//#endregion

module.exports = {
    getFactura,
    getFacturas,
    getUsuarioFactura,
    createFactura
};