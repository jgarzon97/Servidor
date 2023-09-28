const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'baserestaurante',
    port: 5432,
    encoding: 'utf-8'
});

//#region Usuario

async function getUsuarios(req, res) {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM vista_usuarios');
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

async function getUsuarioRole(req, res) {
    const { id } = req.params;
    const query = 'SELECT id_rol FROM Usuario WHERE id_usuario = $1';
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.json(result.rows); // Devuelve solo el primer resultado
        } else {
            res.status(404).json({ message: 'No se encontró el usuario' });
        }
    } catch (err) {
        console.error('Error al obtener el usuario:', err);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getUsuarioNombres(req, res) {
    const { id } = req.params;
    const query = 'SELECT nombre_user, apellido_user FROM Usuario WHERE id_usuario = $1';
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json(result.rows[0]); // Devuelve solo el primer resultado
        } else {
            res.status(404).json({ message: 'No se encontró el usuario' });
        }
    } catch (err) {
        console.error('Error al obtener el usuario:', err);
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function getUsuarioPedido(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM obtener_pedidos($1)';
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

async function iniciarSesion(req, res) {
    const { user_usuario, pass_usuario } = req.body;

    try {
        const client = await pool.connect();
        const query = 'SELECT * FROM usuario WHERE user_usuario = $1';
        const result = await client.query(query, [user_usuario]);
        client.release();

        if (result.rows.length === 1) {
            const usuario = result.rows[0];
            if (usuario.pass_usuario === pass_usuario) {
                const { id_rol } = usuario; // Obtiene el valor de id_rol
                const { id_usuario } = usuario; // Obtiene el valor de id
                const { estado } = usuario; // Obtiene el estado
                const { nombre_user } = usuario; // Obtiene el estado
                const { apellido_user } = usuario; // Obtiene el estado

                res.status(200).json({ message: 'Inicio de sesión exitoso', id_rol, id_usuario, estado, nombre_user, apellido_user });
            } else {
                res.status(401).json({ error: 'Contraseña incorrecta' });
            }
        } else {
            res.status(404).json({ error: 'Usuario no encontrado' });
        }
    } catch (error) {
        console.error('Error en la autenticación:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
}


async function authenticateUsuario(req, res) {
    const { user_usuario, pass_usuario } = req.body;
    const query = 'SELECT * FROM Usuario WHERE user_usuario = $1 AND pass_usuario = $2';
    const values = [user_usuario, pass_usuario];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount === 1) {
            const usuario = result.rows[0];
            let mensajeBienvenida = '';
            if (usuario.id_rol === 1) {
                mensajeBienvenida = `Bienvenido Administrador, ${usuario.nombre_user}`;
            } else if (usuario.id_rol === 2) {
                mensajeBienvenida = `Bienvenido Camarero, ${usuario.nombre_user}`;
            }
            // Autenticación exitosa con mensaje personalizado
            res.status(200).json({ message: 'Autenticación exitosa', welcomeMessage: mensajeBienvenida, rol: usuario.id_rol });
        } else {
            // Usuario o contraseña incorrectos
            res.status(401).json({ message: 'Usuario o contraseña incorrectos' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

//#endregion

module.exports = {
    // Usuario
    getUsuario,
    getUsuarioNombres,
    getUsuarioPedido,
    getUsuarioRole,
    getUsuarios,
    createUsuario,
    authenticateUsuario,
    iniciarSesion
};