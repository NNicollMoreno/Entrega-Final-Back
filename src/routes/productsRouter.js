const express = require("express");
const Product = require("../models/Product");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { limit = 10, page = 1, sort, query } = req.query;

    const filter = query
      ? { $or: [{ category: query }, { status: query === "true" }] }
      : {};
    const sortOrder =
      sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : {};

    const options = {
      limit: parseInt(limit),
      page: parseInt(page),
      sort: sortOrder,
    };

    const products = await Product.paginate(filter, options);

    res.json({
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      prevPage: products.hasPrevPage ? products.page - 1 : null,
      nextPage: products.hasNextPage ? products.page + 1 : null,
      page: products.page,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      prevLink: products.hasPrevPage
        ? `/api/products?page=${products.page - 1}`
        : null,
      nextLink: products.hasNextPage
        ? `/api/products?page=${products.page + 1}`
        : null,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { title, description, price, code, stock, category } = req.body;

    if (!title || !description || !price || !code || !stock || !category) {
      return res.status(400).json({
        status: "error",
        message: "Todos los campos son obligatorios",
      });
    }

    if (typeof price !== "number" || typeof stock !== "number") {
      return res.status(400).json({
        status: "error",
        message: "El precio y el stock deben ser numéricos",
      });
    }

    const newProduct = new Product(req.body);
    await newProduct.save();
    res.status(201).json({
      status: "success",
      message: "Producto creado",
      payload: newProduct,
    });
  } catch (error) {
    console.error("Error al crear producto:", error);
    if (error.code === 11000) {
      res.status(400).json({
        status: "error",
        message: "El código ya existe, debe ser único",
      });
    } else {
      res
        .status(500)
        .json({ status: "error", message: "Error interno del servidor" });
    }
  }
});

router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, stock, category } = req.body;

    if (price && typeof price !== "number") {
      return res
        .status(400)
        .json({ status: "error", message: "El precio debe ser numérico" });
    }
    if (stock && typeof stock !== "number") {
      return res
        .status(400)
        .json({ status: "error", message: "El stock debe ser numérico" });
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updatedProduct) {
      return res
        .status(404)
        .json({ status: "error", message: "Producto no encontrado" });
    }

    res.json({
      status: "success",
      message: "Producto actualizado",
      payload: updatedProduct,
    });
  } catch (error) {
    console.error("Error al actualizar producto:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

module.exports = router;
