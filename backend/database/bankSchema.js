const mongoose = require("mongoose");
mongoose.connect("mongodb://127.0.0.1:27017/users");

const bankSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  balance: { type: Number, required: true },
});

const Account = mongoose.model("Account", bankSchema);

module.exports = Account;
