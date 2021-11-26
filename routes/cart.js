const router = require("express").Router();
const {
  verifyTokenAuthorization,
  verifyTokenAdmin,
  verifyToken,
} = require("./verifyToken");
const Cart = require("../models/Cart");

//CREATE CART
router.post("/", verifyToken, async (req, res) => {
  const cart = new Cart(req.body);

  try {
    const savedCart = await cart.save();
    res.status(201).json(savedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE CART
router.put("/:id", verifyTokenAuthorization, async (req, res) => {
  try {
    const updatedCart = await Cart.findOneAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE CART
router.delete("/:id", verifyTokenAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(201).json("Cart has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET CART OF USER
router.get("/find/:userId", verifyTokenAuthorization, async (req, res) => {
  try {
    const cart = await Cart.find({ userId: req.params.userId });
    res.status(201).json(cart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL CARTS
router.get("/", verifyTokenAdmin, async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(201).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
