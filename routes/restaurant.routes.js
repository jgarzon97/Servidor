const { Router } = require('express');
const router = new Router();

var { getCliente, getClientes, createCliente} = require('../controllers/clientes.controllers');
var { getPedido, getPedidos, createPedido, updatePedido, deletePedido } = require('../controllers/pedidos.controllers');
var { getUsuario, getUsuarios, getUsuarioPedido, createUsuario, iniciarSesion, getUsuarioRole, getUsuarioNombres, authenticateUsuario } = require('../controllers/usuarios.controllers');
var { getCategoria, getCategorias, createCategoria } = require('../controllers/categorias.controllers');
var { getProducto, obtenerIdPorNombre, getVistaProductos, getNameProductos, createProducto } = require('../controllers/productos.controllers');
var { getMesa, getMesas, getMesaEstado, createMesa, updateMesa, deleteMesa } = require('../controllers/mesas.controllers');
var { getFactura, getUsuarioFactura, getFacturas, createFactura} = require('../controllers/facturas.controllers');
var { getPedido_Producto, getPedido_Productos, getDetalles_Productos, createPedido_Producto, updatePedido_Producto, deletePedido_Producto} = require('../controllers/pedido.producto.controllers');

// Rutas para la tabla "Pedido"
router.get('/pedido/:id', getPedido);
router.get('/pedidos', getPedidos);
router.post('/pedido', createPedido);
router.put('/pedido/:id', updatePedido);
router.delete('/pedido/:id', deletePedido);

// Rutas para la tabla "Usuario"
router.get('/usuario/:id', getUsuario);
router.get('/usuarioNombres/:id', getUsuarioNombres);
router.get('/usuarioRoles/:id', getUsuarioRole);
router.get('/usuario-pedido/:id', getUsuarioPedido);
router.get('/usuarios', getUsuarios);
router.post('/usuario', createUsuario);
router.post('/auth', authenticateUsuario);
router.post('/iniciarSesion', iniciarSesion);

// Rutas para la tabla "Categoria"
router.get('/categoria/:id', getCategoria);
router.get('/categorias', getCategorias);
router.post('/categoria', createCategoria);

// Rutas para la tabla "Mesa"
router.get('/mesa/:id', getMesa);
router.get('/mesas', getMesas);
router.get('/mesasDisponible', getMesaEstado);
router.post('/mesa', createMesa);
router.put('/mesa/:id', updateMesa);
router.delete('/mesa/:id', deleteMesa);

// Rutas para la tabla "Factura"
router.get('/factura/:id', getFactura);
router.get('/facturas', getFacturas);
router.get('/usuario-factura/:id', getUsuarioFactura);
router.post('/factura', createFactura);

// Rutas para la tabla "Cliente"
router.get('/cliente/:id', getCliente);
router.get('/clientes', getClientes);
router.post('/cliente', createCliente);

// Rutas para la tabla "Producto"
router.get('/producto/:id', getProducto);
router.get('/obtenerIdPorNombre/:nombre', obtenerIdPorNombre);
router.get('/productos', getVistaProductos);
router.get('/nameproductos', getNameProductos);
router.post('/producto', createProducto);

// Rutas para la tabla "Pedido_Producto"
router.get('/pedidoProducto/:id', getPedido_Producto);
router.get('/pedidoProductos', getPedido_Productos);
router.get('/detallesProductos/:id', getDetalles_Productos);
router.post('/pedidoProducto', createPedido_Producto);
router.put('/pedidoProducto/:id', updatePedido_Producto);
router.delete('/pedidoProducto/:id', deletePedido_Producto);

module.exports = router;