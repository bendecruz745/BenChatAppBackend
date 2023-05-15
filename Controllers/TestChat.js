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
    const LOGGEDOUT_EVENT = "loggedOut";
    const chatMembers = [];

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
        const { exp } = jwt.decode(token);
        console.log("verified username is ", payload.username);
        console.log(
          "current time and token expiration time ",
          Date.now(),
          " ",
          exp * 1000
        );
        return payload.username;
      } catch (error) {
        console.log("Error verifying login, error as follows ", error);
        io.in(socket.id).emit(LOGGEDOUT_EVENT);
        socket.leave(roomId);
        return error;
      }
    };

    let username = verifyLogin();
    const autoAuthInterval = setInterval(verifyLogin, 60000);

    const doc = await Chat.findOne({ roomId });

    socket.join(roomId);
    if (!doc || roomId === null) {
      console.log("creating new room with roomId", roomId);
      const doc = await Chat.create({
        roomId: roomId,
        chatMembers: [
          {
            [username]: {
              status: "Online",
            },
          },
        ],
      });
      await doc.save();
    } else {
      io.in(roomId).emit(RETRIEVE_CHAT_HISTORY, doc);
    }

    socket["username"] = username;

    // Listen for new messages
    socket.on(NEW_CHAT_MESSAGE_EVENT, async (data) => {
      console.log("New chat message in ", roomId);
      let testVar = await io.fetchSockets();
      testVar.map((data, i) => {
        console.log(data.username);
      });
      const timeSent = new Date().toISOString();
      // console.log("socket id is ", socket.id);
      try {
        let username = verifyLogin();
        if (typeof username === "object") {
          throw new Error(
            "Login verification failed in NEW_CHAT_MESSAGE_EVENT"
          );
        }
        io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, {
          ...data,
          senderUsername: username,
          timeSent: timeSent,
        });
        await Chat.findOneAndUpdate(
          { roomId },
          {
            $push: {
              chatMessages: {
                messageBody: data.messageBody,
                senderId: data.senderId,
                senderUsername: username,
                timeSent: timeSent,
              },
            },
          }
        );
      } catch (error) {
        console.log(
          "error sending message, user not verified or error thrown, here is the error though ",
          error
        );
      }
    });

    // Leave the room if the user closes the socket
    socket.on("disconnect", () => {
      console.log("triggering disconnect on roomId " + roomId);
      socket.leave(roomId);
      clearInterval(autoAuthInterval);
    });
  });
  // });
};
