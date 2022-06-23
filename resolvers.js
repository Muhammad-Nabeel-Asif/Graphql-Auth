require("dotenv").config();

const jwt = require("jsonwebtoken");

const User = require("./models/userModel");

const resolvers = {
  Query: {
    async getMyProfile(parent, args, context) {
      const { user } = context;
      const myProfile = await User.findById({ _id: user.id });
      const { username, email, role } = myProfile;

      return {
        username,
        email,
        role,
      };
    },

    async getAllUsers(parent, args, context) {
      const { user } = context;
      const myProfile = await User.findById({ _id: user.id });

      if (myProfile.role !== "admin") {
        return {
          error: "You don't have permission to get other users",
        };
      }

      const users = await User.find();

      return users;
    },

    async logout(parent, args, context) {
      const { user } = context;
      try {
        const token = jwt.sign(
          { id: user.id },
          `${process.env.JWT_SECRET_KEY}`,
          {
            expiresIn: "1s",
          }
        );
        return token;
      } catch (error) {
        console.log(error);
        return "cannot logout due to server error";
      }
    },
  },
  Mutation: {
    async signIn(parent, args, context) {
      const { email, password } = args;

      const user = await User.findOne({ email }).select("+password");

      if (!user || !(await user.comparePasswords(password, user.password))) {
        return {
          error: "incorrect email or password",
        };
      }

      return {
        token: jwt.sign({ id: user._id }, `${process.env.JWT_SECRET_KEY}`, {
          expiresIn: `${process.env.JWT_EXPIRE_TIME}`,
        }),
      };
    },

    async signUp(parent, args, context) {
      const { email, password, username, role } = args;

      if (!email || !password || !username) {
        return new Error("Invalid credentials");
      }

      const user = await User.create({ username, email, password, role });

      // validating before sending token
      !user && {
        return: {
          error: "something went wrong, user can't be created",
        },
      };

      // generating token
      const token = jwt.sign(
        { id: user._id },
        `${process.env.JWT_SECRET_KEY}`,
        {
          expiresIn: `${process.env.JWT_EXPIRE_TIME}`,
        }
      );

      return {
        token,
      };
    },
  },
};

module.exports = resolvers;
