require("dotenv").config();

const jwt = require("jsonwebtoken");

// get the user info from a JWT
const getUser = (token) => {
  if (token) {
    try {
      // return the user information from the token
      return jwt.verify(token, `${process.env.JWT_SECRET_KEY}`);
    } catch (err) {
      // if there's a problem with the token, throw an error
      return { error: true, msg: "Session invalid" };
    }
  }
};

module.exports = getUser;
