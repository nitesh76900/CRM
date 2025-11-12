const mongoose = require("mongoose");

const blockedTokenSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), expires: '7d' }
});

const BlockedToken = mongoose.model("BlockedToken", blockedTokenSchema);

module.exports = BlockedToken;
