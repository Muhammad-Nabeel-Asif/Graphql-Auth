require("dotenv").config();

const { ApolloServer } = require("apollo-server-express");
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageDisabled,
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");
const express = require("express");
const http = require("http");
const mongoose = require("mongoose");

const typeDefs = require("./schema");
const resolvers = require("./resolvers");
const getUser = require("./utils/verifyUser");

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const httpServer = http.createServer(app);
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => {
      if (
        req.body.query.match("getMyProfile") ||
        req.body.query.match("getAllUsers") ||
        req.body.query.match("logout")
      ) {
        if (req.headers && req.headers.authorization) {
          const auth = req.headers.authorization;
          const parts = auth.split(" ");
          const bearer = parts[0];
          const token = parts[1];
          if (bearer == "Bearer") {
            const user = getUser(token);
            if (user.error) {
              throw Error(user.msg);
            } else return { user };
          } else {
            throw Error("Authentication must use Bearer.");
          }
        } else {
          throw Error("User must be authenticated.");
        }
      }
    },
    csrfPrevention: true,
    cache: "bounded",
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      ApolloServerPluginLandingPageDisabled(),
      ApolloServerPluginLandingPageGraphQLPlayground(),
    ],
  });

  await server.start();
  server.applyMiddleware({ app });
  await mongoose.connect(`${process.env.MONGO_URI}`);
  await new Promise((resolve) => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}

startApolloServer(typeDefs, resolvers);
