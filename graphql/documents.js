const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLID,
    GraphQLList,
    GraphQLNonNull,
} = require("graphql");

const CommentType = require("./comment.js");

const DocumentType = new GraphQLObjectType({
    name: "Document",
    description: "This represents a document",
    fields: () => ({
        _id: {
            type: new GraphQLNonNull(GraphQLID),
            description: "Object ID of the document."
        },
        title: { 
            type: new GraphQLNonNull(GraphQLString),
            description: "Title of the document."
        },
        content: { 
            type: new GraphQLNonNull(GraphQLString),
            description: "Content of the document."
        },
        type: { 
            type: new GraphQLNonNull(GraphQLString),
            description: "Document type."
        },
        owner: { 
            type: GraphQLString,
            description: "The owner of the document."
        },
        invited: {
            type: new GraphQLList(GraphQLString),
            description: "Invited collaborators."
        },
        collaborators: {
            type: new GraphQLList(GraphQLString),
            description: "Active collaborators",
        },
        comments: {
            type: new GraphQLList(CommentType),
            description: "Document comments."
        },
        created: { 
            type: new GraphQLNonNull(GraphQLString),
            description: "Timestamp of document creation."
        },
        updated: { 
            type: new GraphQLNonNull(GraphQLString),
            description: "Timestamp of last document update."
        },
        doc_id: { 
            type: new GraphQLNonNull(GraphQLID),
            description: "The document ID."
        },
    }),
});

module.exports = DocumentType;
