const { Pool } = require('pg');

const pool = new Pool({
    host: '127.0.0.1',
    user: 'postgres',
    password: 'admin',
    database: 'baserestaurante',
    port: 5432
});

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

// Vista personalizada con la tabla Productos y Pedido_Producto
async function getDetalles_Productos(req, res) {
    const { id } = req.params;
    const query = 'SELECT * FROM Detalles_Producto WHERE id_pedido = $1';
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        res.status(200);
        if (result.rowCount > 0) {
            res.json(result.rows);
        } else {
            res.status(500).json({ message: 'No hay registros para este pedido' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

// USANDO LA FUNCION insertar_producto_en_pedido
// async function createPedido_Producto(req, res) {
//     const { id_pedido, id_producto, cantidad, detalle } = req.body;
//     const query = 'SELECT insertar_producto_en_pedido($1, $2, $3, $4)';
//     const values = [id_pedido, id_producto, cantidad, detalle];
//     try {
//         const client = await pool.connect();
//         await client.query('BEGIN'); // Iniciar una transacción
//         const result = await client.query(query, values);

//         // Verificar si ocurrió un error en la función del servidor de la base de datos
//         if (result.rows.length === 1 && result.rows[0].insertar_producto_en_pedido === null) {
//             await client.query('ROLLBACK'); // Deshacer la transacción en caso de error
//             res.status(400).json({ message: 'No se guardaron los detalles del Pedido' });
//         } else {
//             await client.query('COMMIT'); // Confirmar la transacción exitosa
//             res.status(200).json({ message: 'Se guardaron los detalles del Pedido' });
//         }

//         client.release();
//     } catch (err) {
//         res.status(500).json({ error: "Error en el servidor" });
//     }
// }

async function createPedido_Producto(req, res) {
    const { id_pedido, id_producto, cantidad, detalle } = req.body;
    const query = 'INSERT INTO Pedido_Producto (id_pedido, id_producto, cantidad, detalle) VALUES ($1, $2, $3, $4)';
    const values = [id_pedido, id_producto, cantidad, detalle];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Se guardaron con éxito los detalles' });
        } else {
            res.status(400).json({ message: 'No se guardaron los detalles' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}


// Asegúrate de exportar la función createPedido_Producto


async function updatePedido_Producto(req, res) {
    const { id } = req.params;
    const { id_producto, cantidad } = req.body;
    const query = 'UPDATE Pedido_Producto SET id_producto=$2, cantidad=$3 WHERE id_pedido=$1';
    const values = [id, id_producto, cantidad];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'Se actualizaron los detalles' });
        } else {
            res.status(400).json({ message: 'No se actualizó' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

async function deletePedido_Producto(req, res) {
    const { id } = req.params;
    const query = 'DELETE FROM Pedido_Producto WHERE id_pedido=$1'
    const values = [id];
    try {
        const client = await pool.connect();
        const result = await client.query(query, values);
        client.release();
        if (result.rowCount > 0) {
            res.status(200).json({ message: 'El detalle ha sido eliminado' });
        } else {
            res.status(500).json({ message: 'No existe el detalle' });
        }
    } catch (err) {
        res.status(500).json({ error: "Error en el servidor" });
    }
}

//#endregion

module.exports = {
    getPedido_Producto,
    getPedido_Productos,
    getDetalles_Productos,
    createPedido_Producto,
    updatePedido_Producto,
    deletePedido_Producto
};
