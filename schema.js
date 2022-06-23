const { gql } = require("apollo-server");

const typeDefs = gql`
  type User {
    username: String
    email: String
    password: String
    role: String
  }

  type SignInResponse {
    token: String
    error: String
  }

  type SignUpResponse {
    token: String
    error: String
  }

  type MyProfile {
    username: String
    email: String
    role: String
  }

  type AllUsers {
    _id: String
    username: String
    email: String
    role: String
    error: String
  }

  type Query {
    getMyProfile: MyProfile
    getAllUsers: [AllUsers]
    logout: String
  }

  type Mutation {
    signUp(
      username: String
      email: String
      password: String
      role: String
    ): SignUpResponse
    signIn(email: String, password: String): SignInResponse
  }
`;

module.exports = typeDefs;
