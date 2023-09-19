const express = require('express');
const cors = require('cors');
const app = express();

var restaurant_routes = require('./routes/restaurant.routes');

// Configurar CORS
app.use(cors());

// Middelwares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Rutas
app.use(restaurant_routes);
app.listen("3000");
console.log("Server up localhost:3000");