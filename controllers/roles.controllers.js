const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'baserestaurante',
    port: 5432
});


async function getRoles(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM Rol');
        client.release();
        res.json(result.rows);
    } catch (error) {
        console.error('Error al obtener los roles:', error);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

module.exports = {
    getRoles
};
