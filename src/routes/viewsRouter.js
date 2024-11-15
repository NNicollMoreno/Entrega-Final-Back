const express = require("express");
const Product = require("../models/Product");
const Cart = require("../models/Cart");

const router = express.Router();

// Ruta para mostrar la vista de productos con paginación
router.get("/products", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort } = req.query;
    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sort === "desc" ? { price: -1 } : { price: 1 },
    };
    const products = await Product.paginate({}, options);
    res.render("index", {
      products: products.docs,
      totalPages: products.totalPages,
      page: products.page,
    });
  } catch (error) {
    res.status(500).send("Error al cargar productos");
  }
});

// Ruta para la vista de productos en tiempo real
router.get("/realtimeproducts", async (req, res) => {
  try {
    const products = await Product.find();
    res.render("realTimeProducts", { products });
  } catch (error) {
    res.status(500).send("Error al cargar productos en tiempo real");
  }
});

module.exports = router;
