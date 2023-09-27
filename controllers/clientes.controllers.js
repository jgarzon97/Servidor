const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'baserestaurante',
    port: 5432
});

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
    const { cedula, nombre, apellido, direccion, email, telefono } = req.body;
    const query = 'INSERT INTO Cliente (cedula, nombre, apellido, direccion, email, telefono) VALUES ($1, $2, $3, $4, $5, $6)';
    const values = [cedula, nombre, apellido, direccion, email, telefono];
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

module.exports = {
    // Cliente
    getCliente,
    getClientes,
    createCliente
};