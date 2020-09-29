const { gql } = require('apollo-server');

module.exports = gql`
    type User {
        username: String!
        email: String!
    }
    type Query {
      getUsers: [User]!
    }
    type Mutation {
      signUp(username: String!, email: String!, password: String!, confirmPassword: String!): User!
    }
`;