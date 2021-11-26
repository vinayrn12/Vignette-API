const router = require("express").Router();
const { verifyTokenAuthorization, verifyTokenAdmin } = require("./verifyToken");
const CryptoJS = require("crypto-js");
const User = require("../models/User");

//UPDATE USER
router.put("/:id", verifyTokenAuthorization, async (req, res) => {
  if (req.body.password) {
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_SEC
    ).toString();
  }

  try {
    const updatedUser = await User.findOneAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    const { password, ...others } = updatedUser._doc;
    res.status(200).json({ ...others });
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE USER
router.delete("/:id", verifyTokenAuthorization, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(201).json("User has been deleted");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET USER
router.get("/find/:id", verifyTokenAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    const { password, ...others } = user._doc;
    res.status(201).json(others);
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL USERS
router.get("/", verifyTokenAdmin, async (req, res) => {
  const query = req.query.new;
  try {
    const users = query
      ? await User.find().sort({ _id: -1 }).limit(5)
      : await User.find();
    res.status(201).json(users);
  } catch (err) {
    res.status(501).json(err);
  }
});

//GET USER STATS
router.get("/stats", verifyTokenAdmin, async (req, res) => {
  const date = new Date();
  const lastYear = new Date(date.setFullYear(date.getFullYear() - 1));

  try {
    const data = await User.aggregate([
      { $match: { createdAt: { $gte: lastYear } } },
      {
        $project: {
          month: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$month",
          total: { $sum: 1 },
        },
      },
    ]);
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
