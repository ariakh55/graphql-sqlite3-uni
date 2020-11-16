const graphql = require('graphql');
const { reject } = require('lodash');
const utils = require('../utils');

const { 
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLInt,
    GraphQLSchema,
    GraphQLList,
    GraphQLNonNull
} = graphql;

const PersonType = new GraphQLObjectType({
    name: 'Person',
    fields: () => ({
        id: {type: GraphQLID},
        name: {type: GraphQLString},
        age: {type: GraphQLInt},
        posts: {
            type: new GraphQLList(PostType),
            resolve: (root,args,context,info) => {
                return new Promise((resolve,reject) => {
                    utils.database.all("SELECT * FROM posts where authorID = (?)",[root.id],function (err,row) {
                        if(err) reject([]);
                        resolve(row);
                    })
                });
            }
        }
    })
});

const PostType = new GraphQLObjectType({
    name: 'Post',
    fields: () => ({
        id: {type: GraphQLID},
        title: {type: GraphQLString},
        author: {
            type: PersonType,
            resolve: (root,args,context,info) => {
                return new Promise((resolve,reject) => {
                    utils.database.all("SELECT * FROM people where id = (?)", [root.authorID],function (err,row) {
                        if(err) reject([]);
                        resolve(row[0]);
                    })
                })
            }
        }
    })
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        person:{
            type: PersonType,
            args: {id: {type: new GraphQLNonNull(GraphQLID)}},
            resolve: (root,args, context, info) => {
                return new Promise((resolve,reject) => {
                    utils.database.all("SELECT * FROM people where id=(?);", [args.id],function (err,row) {
                        if(err) reject([]);
                        resolve(row[0]);
                    })
                })
            }
        },
        post: {
            type: PostType,
            args: { id: { type: new GraphQLNonNull(GraphQLID) } },
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    utils.database.all("SELECT * FROM posts where id=(?);", [args.id], function (err, row) {
                        if (err) reject([]);
                        resolve(row[0]);
                    })
                })
            }
        },
        people: {
            type: new GraphQLList(PersonType),
            args: { limit: { type: GraphQLInt}, sort: { type: GraphQLString}},
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    if(args.limit && args.sort){
                        var sort = args.sort.split(':');
                        utils.database.all(`SELECT * FROM people order by ${sort[0]} ${sort[1]} limit ${args.limit}`,
                            function (err,row) {
                            if(err) reject([]);
                            resolve(row);
                        });
                    }
                    if(args.sort){
                        var sort = args.sort.split(':');
                        utils.database.all(`SELECT * FROM people order by ${sort[0]} ${sort[1]}`,
                            function (err, row) {
                            if (err) reject([]);
                            resolve(row);
                        });
                    }
                    if(args.limit)
                        utils.database.all("SELECT * FROM people limit (?)",
                            [args.limit], function (err, row) {
                            if (err) reject([]);
                            resolve(row);
                        });
                    utils.database.all("SELECT * FROM people", function (err, row) {
                        if (err) reject([]);
                        resolve(row);
                    });
                });
            }
        },
        posts: {
            type: new GraphQLList(PostType),
            args: { limit: { type: GraphQLInt }, sort: { type: GraphQLString } },
            resolve: (root, args, context, info) => {
                return new Promise((resolve, reject) => {
                    if (args.limit && args.sort) {
                        var sort = args.sort.split(':');
                        utils.database.all(`SELECT * FROM posts order by ${sort[0]} ${sort[1]} limit ${args.limit}`,
                            function (err, row) {
                            if (err) reject([]);
                            resolve(row);
                        });
                    }
                    if (args.sort) {
                        var sort = args.sort.split(':');
                        utils.database.all(`SELECT * FROM posts order by ${sort[0]} ${sort[1]}`,
                            function (err, row) {
                            if (err) reject([]);
                            resolve(row);
                        });
                    }
                    if (args.limit)
                        utils.database.all("SELECT * FROM posts limit (?)",
                            [sort[0], sort[1]], function (err, row) {
                            if (err) reject([]);
                            resolve(row);
                        });
                    utils.database.all("SELECT * FROM posts",function (err, row) {
                        if (err) reject([]);
                        resolve(row);
                    });
                });
            }
        }
    }
});

const Mutation = new GraphQLObjectType({
    name: 'MutationType',
    fields: {
        addPerson: {
            type: PersonType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID)},
                name: {type: new GraphQLNonNull(GraphQLString)},
                age: {type: new GraphQLNonNull(GraphQLInt)}
            },
            resolve: (root,args) => {
                return new Promise((resolve,reject) => {
                    utils.database.run(`INSERT INTO people(id,name, age) values ('${args.id}','${args.name}',${args.age});`,function (err) {
                        if(err) reject(null);
                        utils.database.get(`SELECT id,name,age FROM people where id = ${args.id}`,(err,row) => {
                            if(err) reject([]);
                            resolve(row[0]);
                        });
                    });
                });
            }
        },
        addPost: {
            type: PostType,
            args: {
                id: { type: new GraphQLNonNull(GraphQLID) },
                title: { type: new GraphQLNonNull(GraphQLString) },
                authorID: { type: new GraphQLNonNull(GraphQLID) }
            },
            resolve: (root, args) => {
                return new Promise((resolve, reject) => {
                    utils.database.run(`INSERT INTO posts(id,title,authorID) values ('${args.id}','${args.title}',${args.authorID});`, function (err) {
                        if (err) reject(null);
                        utils.database.get(`SELECT id,title,authorID FROM posts where id = ${args.id}`, (err, row) => {
                            if (err) reject([]);
                            resolve(row[0]);
                        });
                    });
                });
            }
        }
    }
});

module.exports = new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation
})