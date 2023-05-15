require("dotenv").config(); // loading env variables
const jwt = require("jsonwebtoken");
const { SECRET = "secret" } = process.env;

// MIDDLEWARE FOR AUTHORIZATION (MAKING SURE THEY ARE LOGGED IN)
const isLoggedIn = async (req, res, next) => {
  try {
    // check if auth header exists
    if (req.headers.authorization) {
      // parse token from header
      const token = req.headers.authorization.split(" ")[1]; //split the header and get the token
      if (token) {
        const payload = jwt.verify(token, process.env.SECRET);
        if (payload) {
          const newToken = jwt.sign({ username: payload.username }, SECRET, {
            expiresIn: "300s",
          });
          // store user data in request object
          req.user = payload;
          req.newToken = newToken;
          next();
        } else {
          res.status(400).json({ error: "token verification failed" });
        }
      } else {
        res.status(400).json({ error: "malformed auth header" });
      }
    } else {
      res.status(400).json({ error: "No authorization header" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};

// export custom middleware
module.exports = {
  isLoggedIn,
};
