const Chat = require("../models/Chat"); // import Todo model

module.exports = (app) => {
  app.on("connection", async function (socket) {
    console.log("app on run, connection should be established");
    // console.log("interacting with socket", socket);
    const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
    const CHAT_HISTORY_EVENT = "chatHistory";
    const RETRIEVE_CHAT_HISTORY = "retrieveChatHistory";

    const { roomId } = socket.handshake.query;

    const chatInfo = await Chat.findOne({ roomId });

    socket.join(roomId);
    if (!chatInfo) {
      Chat.create({ roomId: roomId });
    } else {
      io.in(roomId).emit(RETRIEVE_CHAT_HISTORY, chatInfo);
    }

    socket.on(NEW_CHAT_MESSAGE_EVENT, async (data) => {
      console.log("testing stoof");
    });
    // console.log(chatInfo);

    // Listen for new messages
    socket.on(NEW_CHAT_MESSAGE_EVENT, async (data) => {
      console.log("new chat msg received");
      io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
      await Chat.findOneAndUpdate(
        { roomId },
        {
          $push: {
            chatMessages: {
              messageBody: data.messageBody,
              senderId: data.senderId,
            },
          },
        }
      );
    });

    // Leave the room if the user closes the socket
    socket.on("disconnect", () => {
      socket.leave(roomId);
    });
  });
  // });
};
