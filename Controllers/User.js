require("dotenv").config(); // load .env variables
const { Router } = require("express"); // import router from express
const UserDetail = require("../models/UserDetail"); // import user model
const bcrypt = require("bcryptjs"); // import bcrypt to hash passwords
const jwt = require("jsonwebtoken"); // import jwt to sign tokens
const { isLoggedIn } = require("./middleware"); // import isLoggedIn custom middleware

const router = Router(); // create router to create route bundle

//DESTRUCTURE ENV VARIABLES WITH DEFAULTS
const { SECRET = "secret" } = process.env;

router.post("/test", async (req, res) => {
  res.json("test user response");
});

// Signup route to create a new user
router.post("/signup", async (req, res) => {
  try {
    // hash the password
    req.body.password = await bcrypt.hash(req.body.password, 10);

    // create a new user
    const user = await UserDetail.findOne({ username: req.body.username });
    if (user) {
      res
        .status(400)
        .json({ error: "Username already exists, please try another one." });
    } else {
      const user = await UserDetail.create(req.body);
      // send new user as response
      res.json(user);
    }
  } catch (error) {
    res.status(400).json({ error });
    console.log(error);
  }
});

// Login route to verify a user and get a token
router.post("/login", async (req, res) => {
  try {
    // check if the user exists
    const user = await UserDetail.findOne({ username: req.body.username });
    if (user) {
      //check if password matches
      const result = await bcrypt.compare(req.body.password, user.password);
      if (result) {
        // sign token and send it in response
        const token = await jwt.sign({ username: user.username }, SECRET, {
          expiresIn: "1hr",
        });
        const username = user.username;
        res.json({ token, username });
      } else {
        res.status(400).json({ error: "Incorrect password" });
      }
    } else {
      res.status(400).json({ error: "User doesn't exist" });
      console.log(
        `user doesn't exist hit, data as follows ${JSON.stringify(req.body)}`
      );
    }
  } catch (error) {
    res.status(400).json({ error });
  }
});

router.post("/isLoggedIn", isLoggedIn, async (req, res) => {
  console.log("isLoggedIn hit and verified");
  // console.log(`middleware payload is ${JSON.stringify(req.user)}`);
  res.json({
    LoginCheck: "Successful",
    username: req.user.username,
    newToken: req.newToken,
  });
});

module.exports = router;
