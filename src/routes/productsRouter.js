const express = require("express");
const Product = require("../models/Product");
const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, sort, category, available } = req.query;
    const query = {};
    if (category) query.category = category;
    if (available) query.status = available === "true";

    const products = await Product.find(query)
      .sort(sort === "desc" ? { price: -1 } : { price: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const count = await Product.countDocuments(query);

    res.json({
      status: "success",
      payload: products,
      totalPages: Math.ceil(count / limit),
      currentPage: parseInt(page, 10),
      hasNextPage: page * limit < count,
      hasPrevPage: page > 1,
      nextLink:
        page * limit < count
          ? `/api/products?page=${+page + 1}&limit=${limit}`
          : null,
      prevLink:
        page > 1 ? `/api/products?page=${+page - 1}&limit=${limit}` : null,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, code, price, stock, category, thumbnails } =
      req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res
        .status(400)
        .json({ error: "Todos los campos obligatorios deben ser completados" });
    }

    const newProduct = new Product({
      title,
      description,
      code,
      price,
      stock,
      category,
      thumbnails,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error) {
    if (error.code === 11000) {
      return res
        .status(400)
        .json({ error: "El código del producto ya existe" });
    }
    console.error("Error al agregar el producto:", error);
    res.status(500).json({ error: "Error interno del servidor" });
  }
});

module.exports = router;
