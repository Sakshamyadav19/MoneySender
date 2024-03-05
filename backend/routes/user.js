const express = require("express");
const userRouter = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const User = require("../database/usersSchema");
const jwtSecret = require("../config");
const authMiddleware = require("../middleware/authMiddleware");
const Account = require("../database/bankSchema");

const signUpValidate = zod.object({
  name: zod.string(),
  email: zod.string().email(),
  password: zod.string().min(6),
});

const signInValidate = zod.object({
  email: zod.string().email(),
  password: zod.string().min(6),
});

const updateValidate = zod.object({
  name: zod.string().optional(),
  email: zod.string().email().optional(),
  password: zod.string().min(6).optional(),
});

userRouter.post("/signup", async (req, res) => {
  const { success } = signUpValidate.safeParse(req.body);

  const duplicate = await User.findOne({ email: req.body.email });
  if (success) {
    if (duplicate) {
      return res.status(411).json({ message: "User already Exists" });
    }
    const user = await User.create(req.body);
    const userId = user._id;

    const token = jwt.sign({ userId: userId }, jwtSecret);

    await Account.create({
      userId: userId,
      balance: (1 + Math.random() * 10000).toFixed(2),
    });

    return res.status(200).json({
      message: "User created successfully",
      token: token,
    });
  }

  return res.status(411).json({
    message: "Incorrect inputs",
  });
});

userRouter.post("/signin", async (req, res) => {
  const { success } = signInValidate.safeParse(req.body);
  if (success) {
    const user = await User.findOne({
      email: req.body.email,
      password: req.body.password,
    });

    const token = jwt.sign({ userId: user._id }, jwtSecret);
    return res.status(200).json({
      token: token,
    });
  }
  return res.status(411).json({
    message: "Invalid Creds",
  });
});

userRouter.put("/", authMiddleware, async (req, res) => {
  const { success } = updateValidate.safeParse(req.body);
  if (!success) {
    res.json({
      message: "Error while updating information",
    });
  }
  await User.updateOne({ _id: req.userId }, req.body);
  res.json({
    message: "Updated successfully",
  });
});

userRouter.get("/bulk", authMiddleware, async (req, res) => {
  const filter = req.query.filter || "";
  const users = await User.find({
    name: { $regex: filter },
  });

  res.status(200).json({
    user: users.map((user) => user),
  });
});

module.exports = userRouter;
