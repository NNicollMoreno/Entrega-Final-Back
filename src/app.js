const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { engine } = require("express-handlebars");
const path = require("path");
const connectDB = require("./db");
const productsRouter = require("./routes/productsRouter");
const cartsRouter = require("./routes/cartsRouter");
const viewsRouter = require("./routes/viewsRouter");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer);
const port = 8080;

connectDB(); // Conectar a MongoDB

// Configuración de Handlebars
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// Rutas
app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

// WebSocket
io.on("connection", (socket) => {
  console.log("Cliente conectado");
  socket.on("newProduct", (products) => {
    io.emit("updateProductList", products);
  });
  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

httpServer.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});

module.exports = io;
