const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
} = require("graphql");

const UsersType = new GraphQLObjectType({
    name: "User",
    description: "This represents a user",
    fields: () => ({
        _id: {
            type: new GraphQLNonNull(GraphQLID),
            description: "User ID."
        },
        email: { 
            type: new GraphQLNonNull(GraphQLString),
            description: "User email."
        },
        password: { 
            type: new GraphQLNonNull(GraphQLString),
            description: "Encrypted password."
        },
    }),
});

module.exports = UsersType;
