const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'baserestaurante',
    port: 5432
});

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
    const { nombre } = req.body;
    const query = 'INSERT INTO Categoria (nombre) VALUES ($1)';
    const values = [nombre];
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

module.exports = {
    // Categoria
    getCategoria,
    getCategorias,
    createCategoria
};