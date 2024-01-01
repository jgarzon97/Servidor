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
        const result = await client.query('SELECT * FROM Pedido ORDER BY estado DESC');
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
    const { id_usuario, id_mesa } = req.body;
    const query = 'INSERT INTO Pedido (id_usuario, id_mesa) VALUES ($1, $2)';
    const values = [id_usuario, id_mesa];
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

async function updatePedido(req, res) {
    const { id } = req.params;
    const { id_mesa } = req.body;
    const query = 'UPDATE Pedido SET id_mesa=$2 WHERE id_pedido=$1';
    const values = [id, id_mesa];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Se actualizó el Pedido' });
        } else {
            res.status(400).json({ message: 'No se actualizó' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function deletePedido(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM Pedido WHERE id_pedido=$1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Pedido eliminada' });
        } else {
            res.status(500).json({ message: 'No existe el Pedido' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

//#endregion

module.exports = {
    getPedido,
    getPedidos,
    createPedido,
    updatePedido,
    deletePedido
};