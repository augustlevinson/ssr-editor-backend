const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLInt,
    GraphQLFloat,
    GraphQLNonNull,
} = require("graphql");

const CommentType = new GraphQLObjectType({
    name: "Comment",
    description: "An object representing a comment",
    fields: () => ({
        id: {
            type: new GraphQLNonNull(GraphQLID),
            description: "Comment ID."
        },
        content: {
            type: new GraphQLNonNull(GraphQLString),
            description: "The content of the comment."
        },
        user: {
            type: new GraphQLNonNull(GraphQLString),
            description: "E-mail of the user who made the comment."
        },
        created: { 
            type: new GraphQLNonNull(GraphQLString),
            description: "Timestamp of comment creation."
        },
    }),
});

module.exports = CommentType;
