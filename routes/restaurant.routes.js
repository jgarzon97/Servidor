const { Router } = require('express');
const router = new Router();

var {
    // Pedido
    getPedido,
    getPedidos,
    createPedido,
    updatePedido,
    deletePedido,
    // Usuario
    getUsuario,
    getUsuarios,
    getUsuarioNombres,
    createUsuario,
    authenticateUsuario,
    // Categoria
    getCategoria,
    getCategorias,
    createCategoria,
    // Mesa
    getMesa,
    getMesas,
    getMesaEstado,
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
    createPedido_Producto,
    updatePedido_Producto,
    deletePedido_Producto
} = require('../controllers/restaurant.controllers');

// Rutas para la tabla "Pedido"
router.get('/pedido/:id', getPedido);
router.get('/pedidos', getPedidos);
router.post('/pedido', createPedido);
router.put('/pedido/:id', updatePedido);
router.delete('/pedido/:id', deletePedido);


// Rutas para la tabla "Usuario"
router.get('/usuario/:id', getUsuario);
router.get('/usuarioNombres/:id', getUsuarioNombres);
router.get('/usuarios', getUsuarios);
router.post('/usuario', createUsuario);
router.post('/auth', authenticateUsuario);

// Rutas para la tabla "Categoria"
router.get('/categoria/:id', getCategoria);
router.get('/categorias', getCategorias);
router.post('/categoria', createCategoria);

// Rutas para la tabla "Mesa"
router.get('/mesa/:id', getMesa);
router.get('/mesas', getMesas);
router.get('/mesasDisponible', getMesaEstado);
router.post('/mesa', createMesa);

// Rutas para la tabla "Factura"
router.get('/factura/:id', getFactura);
router.get('/facturas', getFacturas);
router.post('/factura', createFactura);

// Rutas para la tabla "Cliente"
router.get('/cliente/:id', getCliente);
router.get('/clientes', getClientes);
router.post('/cliente', createCliente);

// Rutas para la tabla "Producto"
router.get('/producto/:id', getProducto);
router.get('/productos', getProductos);
router.post('/producto', createProducto);

// Rutas para la tabla "Pedido_Producto"
router.get('/pedidoProducto/:id', getPedido_Producto);
router.get('/pedidoProductos', getPedido_Productos);
router.post('/pedidoProducto', createPedido_Producto);
router.put('/pedidoProducto/:id', updatePedido_Producto);
router.delete('/pedidoProducto/:id', deletePedido_Producto);

module.exports = router;