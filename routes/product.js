const router = require("express").Router();
const { verifyTokenAuthorization, verifyTokenAdmin } = require("./verifyToken");
const Product = require("../models/Product");

//CREATE PRODUCT
router.post("/", verifyTokenAdmin, async (req, res) => {
  const product = new Product(req.body);

  try {
    const savedProduct = await product.save();
    res.status(201).json(savedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE PRODUCT
router.put("/:id", verifyTokenAdmin, async (req, res) => {
  try {
    const updatedProduct = await Product.findOneAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedProduct);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE PRODUCT
router.delete("/:id", verifyTokenAdmin, async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.status(201).json("Product has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET PRODUCT
router.get("/find/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
  const qNew = req.query.new;
  const qCategory = req.query.category;
  try {
    let products;
    if (qNew) {
      products = await Product.find().sort({ createdAt: -1 }).limit(1);
    } else if (qCategory) {
      products = await Product.find({
        categories: {
          $in: [qCategory],
        },
      });
    } else {
      products = await Product.find();
    }
    res.status(201).json(products);
  } catch (err) {
    res.status(501).json(err);
  }
});

module.exports = router;
