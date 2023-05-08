require("dotenv").config(); // load .env variables
const express = require("express"); // import express
const morgan = require("morgan"); //import morgan
const { log } = require("mercedlogger"); // import mercedlogger's log function
const cors = require("cors"); // import cors
const UserRouter = require("./Controllers/User");
const NotesRouter = require("./Controllers/Notes");
const TestChat = require("./Controllers/TestChat");

//DESTRUCTURE ENV VARIABLES WITH DEFAULT VALUES
const { PORT = 4000 } = process.env;

// Create Application Object
const app = express();
const httpServer = require("http").createServer(app);
const io = require("socket.io")(httpServer, {
  cors: {
    origin: "*",
  },
});
global.io = io;
TestChat(io);

// GLOBAL MIDDLEWARE
app.use(cors()); // add cors headers
app.use(morgan("tiny")); // log the request for debugging
app.use(express.json()); // parse json bodies

// ROUTES AND ROUTES
app.get("/", (req, res) => {
  res.send("this is the test route to make sure server is working");
});
app.use("/user", UserRouter);

// APP LISTENER
httpServer.listen(PORT, () =>
  log.green("SERVER STATUS", `Listening on port ${PORT}`)
);
