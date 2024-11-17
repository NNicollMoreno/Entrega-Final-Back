const express = require("express");
const connectDB = require("./db");
const productsRouter = require("./routes/productsRouter");
const cartsRouter = require("./routes/cartsRouter");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const exphbs = require("express-handlebars");

connectDB();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", exphbs.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

app.use(express.static(path.join(__dirname, "public")));

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);

app.get("/", (req, res) => {
  res.render("index", { title: "Bienvenido a la API de Productos" });
});

app.get("/realtimeproducts", (req, res) => {
  res.render("realTimeProducts", { title: "Productos en Tiempo Real" });
});

const server = http.createServer(app);
const io = new Server(server);

io.on("connection", (socket) => {
  console.log("Cliente conectado");

  socket.on("productUpdated", (data) => {
    io.emit("updateProducts", data);
  });

  socket.on("disconnect", () => {
    console.log("Cliente desconectado");
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
