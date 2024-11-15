const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");

const router = express.Router();

// DELETE /api/carts/:cid/products/:pid - Eliminar producto del carrito
router.delete("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === pid
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .json({
          status: "error",
          message: "Producto no encontrado en el carrito",
        });
    }

    cart.products.splice(productIndex, 1);
    await cart.save();

    res.json({
      status: "success",
      message: "Producto eliminado del carrito",
      payload: cart,
    });
  } catch (error) {
    console.error("Error al eliminar producto del carrito:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

// PUT /api/carts/:cid - Actualizar el carrito con un nuevo arreglo de productos
router.put("/:cid", async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;

  if (!Array.isArray(products) || products.length === 0) {
    return res
      .status(400)
      .json({
        status: "error",
        message:
          "El arreglo de productos es obligatorio y debe contener al menos un producto",
      });
  }

  try {
    const cart = await Cart.findByIdAndUpdate(cid, { products }, { new: true });
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    res.json({
      status: "success",
      message: "Carrito actualizado",
      payload: cart,
    });
  } catch (error) {
    console.error("Error al actualizar carrito:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

// PUT /api/carts/:cid/products/:pid - Actualizar la cantidad de un producto en el carrito
router.put("/:cid/products/:pid", async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  if (typeof quantity !== "number" || quantity <= 0) {
    return res
      .status(400)
      .json({
        status: "error",
        message: "La cantidad debe ser un número mayor a 0",
      });
  }

  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    const productIndex = cart.products.findIndex(
      (item) => item.product.toString() === pid
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .json({
          status: "error",
          message: "Producto no encontrado en el carrito",
        });
    }

    cart.products[productIndex].quantity = quantity;
    await cart.save();

    res.json({
      status: "success",
      message: "Cantidad de producto actualizada",
      payload: cart,
    });
  } catch (error) {
    console.error(
      "Error al actualizar cantidad de producto en el carrito:",
      error
    );
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

// DELETE /api/carts/:cid - Eliminar todos los productos del carrito
router.delete("/:cid", async (req, res) => {
  const { cid } = req.params;
  try {
    const cart = await Cart.findById(cid);
    if (!cart) {
      return res
        .status(404)
        .json({ status: "error", message: "Carrito no encontrado" });
    }

    cart.products = [];
    await cart.save();

    res.json({ status: "success", message: "Carrito vaciado", payload: cart });
  } catch (error) {
    console.error("Error al vaciar carrito:", error);
    res
      .status(500)
      .json({ status: "error", message: "Error interno del servidor" });
  }
});

module.exports = router;
