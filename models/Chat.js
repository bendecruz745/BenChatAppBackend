const { Schema, model } = require("../db/connection"); // import Schema & model

// Chat Schema
const ChatSchema = new Schema({
  roomId: { type: String, unique: true },
  // chatName: { type: String, unique: true },

  // chatRoles: {
  // Role1: {
  //   roleName: {
  //     type: String,
  //     unique: true,
  //     required: true,
  //     default: "Admin",
  //   },
  //   access: {
  //     message: { type: Boolean, required: true, default: true },
  //     deleteMessage: { type: Boolean, required: true, default: true },
  //     kickUser: { type: Boolean, required: true, default: true },
  //   },
  // },
  // Role2: {
  //   roleName: {
  //     type: String,
  //     unique: true,
  //     required: true,
  //     default: "User",
  //   },
  //   access: {
  //     message: { type: Boolean, required: true, default: true },
  //     deleteMessage: { type: Boolean, required: true, default: false },
  //     kickUser: { type: Boolean, required: true, default: false },
  //   },
  // },
  // },

  // chatMembers: {
  // Member1: {
  //   userName: { type: String, unique: true, required: true },
  //   displayName: { type: String, unique: true, required: true },
  //   roles: [{ type: String }],
  // },
  // Member2: {
  //   userName: { type: String, unique: true, required: true },
  //   displayName: { type: String, unique: true, required: true },
  //   roles: [{ type: String }],
  // }
  // },

  chatMessages: [
    // Message000001: {
    //   userName: { type: String, required: true },
    //   timeSent: { type: Date },
    //   messageBody: { type: String, required: true },
    // },
    // Message000002: {
    //   UserID: { type: String, required: true },
    //   timeSent: { type: Date },
    //   messageBody: { type: String, required: true },
    // },
  ],
});

// Chat model
const Chat = model("Chat", ChatSchema);

module.exports = Chat;
