const Chat = require("../models/Chat"); // import Todo model
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
require("dotenv").config(); // loading env variables
const jwt = require("jsonwebtoken");
const { SECRET = "secret" } = process.env;

module.exports = (app) => {
  app.on("connection", async function (socket) {
    console.log("app on run, connection should be established");
    // console.log("interacting with socket", socket);
    const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
    const CHAT_HISTORY_EVENT = "chatHistory";
    const RETRIEVE_CHAT_HISTORY = "retrieveChatHistory";

    const { roomId, Authorization } = socket.handshake.query;
    // console.log(
    //   "this is what is in socket.handshake.query",
    //   socket.handshake.query
    // );

    const verifyLogin = () => {
      // console.log(
      //   "verify login here, here are the auth headers I have ",
      //   Authorization
      // );
      try {
        const token = Authorization.split(" ")[1];
        const payload = jwt.verify(token, process.env.SECRET);
        console.log("verified username is ", payload.username);
        return payload.username;
      } catch (error) {
        console.log("Error verifying login, error as follows ", error);
        return error;
      }
    };

    const chatInfo = await Chat.findOne({ roomId });

    socket.join(roomId);
    if (!chatInfo) {
      Chat.create({ roomId: roomId });
    } else {
      io.in(roomId).emit(RETRIEVE_CHAT_HISTORY, chatInfo);
    }

    // Listen for new messages
    socket.on(NEW_CHAT_MESSAGE_EVENT, async (data) => {
      console.log("New chat message in ", roomId);
      let username = verifyLogin();
      io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, {
        ...data,
        senderUsername: username,
      });
      await Chat.findOneAndUpdate(
        { roomId },
        {
          $push: {
            chatMessages: {
              messageBody: data.messageBody,
              senderId: data.senderId,
              senderUsername: username,
            },
          },
        }
      );
    });

    // Leave the room if the user closes the socket
    socket.on("disconnect", () => {
      console.log("triggering disconnect on roomId " + roomId);
      socket.leave(roomId);
    });
  });
  // });
};
