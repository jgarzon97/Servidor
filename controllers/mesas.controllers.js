const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'baserestaurante',
    port: 5432
});

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

async function getMesaEstado(req, res) {
    const query = 'SELECT * FROM Mesa WHERE estado = $1';
    const values = ['Disponible']; // Filtrar por estado 'Disponible'
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.status(200).json(result.rows);
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

async function updateMesa(req, res) {
    const { id } = req.params;
    const { num_mesa, capacidad, estado } = req.body;
    const query = 'UPDATE Mesa SET num_mesa=$2, capacidad=$3, estado=$4 WHERE id_mesa=$1';
    const values = [id, num_mesa, capacidad, estado];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Mesa actualizada' });
        } else {
            res.status(400).json({ message: 'No se actualizó' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function deleteMesa(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM Mesa WHERE id_mesa=$1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Mesa eliminada' });
        } else {
            res.status(500).json({ message: 'No existe la eliminada' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

//#endregion

module.exports = {
    getMesa,
    getMesas,
    getMesaEstado,
    createMesa,
    updateMesa,
    deleteMesa
};