const Chat = require("../models/Chat"); // import Todo model
const { countDocuments } = require("../models/UserDetail");
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware
require("dotenv").config(); // loading env variables
const jwt = require("jsonwebtoken");
const filter = require("profanity-filter");

module.exports = (app) => {
  app.on("connection", async function (socket) {
    console.log("app on run, connection should be established");
    // console.log("interacting with socket", socket);
    const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";
    const LOGGEDOUT_EVENT = "loggedOut";
    const MEMBERS_UPDATE = "updateMembers";

    const RETRIEVE_DATA = "retrieveData";

    const { roomId, Authorization } = socket.handshake.query;

    // const updateChatMembers = () => {
    //   chatMembers =
    // }

    const verifyLogin = () => {
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

    let doc = await Chat.findOne({ roomId });

    socket.join(roomId);
    if (!doc || roomId === null) {
      console.log("creating new room with roomId", roomId);
      doc = await Chat.create({
        roomId: roomId,
        chatMembers: [
          {
            username: username,
            status: "Online",
          },
        ],
      });
      await doc.save();
    } else {
      const userPosition = doc.chatMembers.findIndex(
        (user) => user.username === username
      );
      if (userPosition !== -1 || userPosition === 0) {
        doc.chatMembers[userPosition].status = "Online";
      } else {
        doc.chatMembers.push({ username: username, status: "Online" });
      }
      doc.markModified("chatMembers");
      try {
        await doc.save();
      } catch (VersionError) {
        doc = await Chat.findOne({ roomId });
        const userPosition = doc.chatMembers.findIndex(
          (user) => user.username === username
        );
        if (userPosition !== -1 || userPosition === 0) {
          doc.chatMembers[userPosition].status = "Online";
        } else {
          doc.chatMembers.push({ username: username, status: "Online" });
        }
        doc.markModified("chatMembers");
        await doc.save();
      }
      io.in(roomId).emit(RETRIEVE_DATA, doc);
    }

    socket["username"] = username;

    // Listen for new messages
    socket.on(NEW_CHAT_MESSAGE_EVENT, async (data) => {
      console.log("New chat message in ", roomId);
      // let testVar = await io.fetchSockets();
      // testVar.map((data, i) => {
      //   console.log(data.username);
      // });
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
    socket.on("disconnect", async () => {
      console.log("triggering disconnect on roomId " + roomId);
      const updatedDoc = await Chat.findOne({ roomId });
      const userPosition = updatedDoc.chatMembers.findIndex(
        (user) => user.username === username
      );
      if (userPosition !== -1 || userPosition === 0) {
        updatedDoc.chatMembers[userPosition].status = "Offline";
      }
      updatedDoc.markModified("chatMembers");
      await updatedDoc.save();
      io.in(roomId).emit(MEMBERS_UPDATE, updatedDoc.chatMembers);
      socket.leave(roomId);
      clearInterval(autoAuthInterval);
    });
  });
  // });
};
