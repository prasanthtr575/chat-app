const { ApolloServer, gql } = require('apollo-server');
const { sequelize } = require('./database/models');

const typeDefs = require('./graphql/typeDefs');
const resolvers = require('./graphql/resolvers');

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ctx => ctx
});

server.listen().then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);

    sequelize.authenticate()
    .then(()=>console.log('----- connected to db -----'))
    .catch(err=>console.log(err));
});