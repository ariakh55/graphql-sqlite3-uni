const express = require('express');
const graphqlHTTP = require('express-graphql').graphqlHTTP; //Note that it uses destructuring!!
const schema = require('./schema/schema');
const utils = require('./utils');

const app = express();

app.use('/graphql', graphqlHTTP({
    schema,
    graphiql: true
}));

app.listen(4000,() => {
    utils.CreatePeopleTable();
    utils.CreatePostTable();
    console.log('Listening on port 4000');
})