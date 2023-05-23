const { Schema, model } = require("../db/connection"); // import Schema & model

// User Schema
const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  roomHistory: { type: Array },
});

// User model
const User = model("UserDetail", UserSchema);

module.exports = User;
