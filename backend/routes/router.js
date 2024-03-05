const express = require("express");
const userRouter = require("./user");
const acctRouter = require("./account");
const router = express.Router();

router.use("/user", userRouter);
router.use("/account", acctRouter);

module.exports = router;
