const express = require("express");
const authMiddleware = require("../middleware/authMiddleware");
const Account = require("../database/bankSchema");
const { default: mongoose } = require("mongoose");
const acctRouter = express.Router();

acctRouter.get("/balance", authMiddleware, async (req, res) => {
  const account = await Account.findOne({ userId: req.userId });
  res.status(200).json({ balance: account.balance });
});

acctRouter.post("/transfer", authMiddleware, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const { to, amount } = req.body;
  const fromAccount = await Account.findOne({ userId: req.userId }).session(
    session
  );
  const toAccount = await Account.findOne({ userId: req.userId }).session(
    session
  );

  if (fromAccount.balance < amount) {
    await session.abortTransaction();
    res.status(400).json({
      message: "Insufficient balance",
    });
  }

  if (!toAccount) {
    await session.abortTransaction();
    return res.status(400).json({
      message: "Invalid account",
    });
  }

  try {
    await Account.updateOne(
      { userId: req.userId },
      { $inc: { balance: -amount } }
    ).session(session);
    await Account.updateOne(
      { userId: to },
      { $inc: { balance: amount } }
    ).session(session);
    await session.commitTransaction();
    res.status(200).json({
      message: "Transfer successful",
    });
  } catch {
    res.status(400);
  }
});

module.exports = acctRouter;
