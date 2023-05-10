require("dotenv").config(); // load .env variables
const mongoose = require("mongoose"); //import fresh mongoose object
const { log } = require("mercedlogger"); // import merced logger

//DESTRUCTURE ENV VARIABLES
const { MONGO_USERNAME } = process.env;
const { MONGO_PASSWORD } = process.env;
const { MONGO_URI } = process.env;

const DATABASE_URL = `mongodb+srv://${MONGO_USERNAME}:${MONGO_PASSWORD}@${MONGO_URI}`;
// console.log(
//   `AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA Database URL is ${DATABASE_URL}`
// );

// CONNECT TO MONGO
// console.log(DATABASE_URL); //double checking database ur;
mongoose.connect = mongoose.connect(DATABASE_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// CONNECTION EVENTS
mongoose.connection
  .on("open", () => log.green("DATABASE STATE", "Connection Open"))
  .on("close", () => log.magenta("DATABASE STATE", "Connection Open"))
  .on("error", (error) => log.red("DATABASE STATE", error));

// EXPORT CONNECTION
module.exports = mongoose;
