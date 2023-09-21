const { Router } = require('express');
const router = new Router();

var { getPedido, getPedidos, createPedido, getUsuario, getUsuarios, createUsuario, autenticarUsuario, getCategorias, getProductos, createProducto, getMesas, getMesa, createMesa, getFactura, createFactura, getClientes, createPedido_Producto } = require('../controllers/restaurant.controllers');

// Rutas para la tabla "Pedido"
router.get('/pedidos', getPedidos);
router.post('/pedido', createPedido);
router.get('/pedido/:id', getPedido);

// Rutas para la tabla "Usuario"
router.get('/Usuario', getUsuario);
router.get('/usuarios', getUsuarios);
router.post('/usuario', createUsuario);
router.post('/autenticar', autenticarUsuario);

// Rutas para la tabla "Categoria"
router.get('/categorias', getCategorias);

// Rutas para la tabla "Mesa"
router.get('/mesas', getMesas);
router.get('/mesa/:id', getMesa);
router.post('/mesa', createMesa);

// Rutas para la tabla "Factura"
router.get('/facturas', getFactura);
router.post('/factura', createFactura);

// Rutas para la tabla "Cliente"
router.get('/clientes', getClientes);

// Rutas para la tabla "Producto"
router.get('/productos', getProductos);
router.post('/producto', createProducto);

// Rutas para la tabla "Pedido_Producto"
router.post('/pedidoProducto', createPedido_Producto);

module.exports = router;