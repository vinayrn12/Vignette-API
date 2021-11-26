const router = require("express").Router();
const {
  verifyTokenAuthorization,
  verifyTokenAdmin,
  verifyToken,
} = require("./verifyToken");
const Order = require("../models/Order");

//CREATE ORDER
router.post("/", verifyToken, async (req, res) => {
  const order = new Order(req.body);

  try {
    const savedOrder = await order.save();
    res.status(201).json(savedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//UPDATE ORDER
router.put("/:id", verifyTokenAdmin, async (req, res) => {
  try {
    const updatedOrder = await Order.findOneAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE ORDER
router.delete("/:id", verifyTokenAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.status(201).json("Order has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ORDER OF USER
router.get("/find/:userId", verifyTokenAuthorization, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId });
    res.status(201).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL ORDERS
router.get("/", verifyTokenAdmin, async (req, res) => {
  try {
    const orders = await Order.find();
    res.status(201).json(orders);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET MONTHLY INCOME
router.get("/income", verifyTokenAdmin, async (req, res) => {
  const date = new Date();
  const lastMonth = new Date(date.setMonth(date.getMonth() - 1));
  const previousMonth = new Date(new Date().setMonth(lastMonth.getMonth() - 1));
  try {
    const income = await Order.aggregate([
      { $match: { createdAt: { $gte: previousMonth } } },
      {
        $project: {
          month: { $month: "$createdAt" },
          sales: "$amount",
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: "$sales" },
        },
      },
    ]);
    res.status(201).json(income);
  } catch (err) {
    res.json(200).json(err);
  }
});

module.exports = router;
