const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
    GraphQLInt,
    GraphQLNonNull
} = require('graphql');

const DocumentType = require("./documents.js");
const documents = require("../docs.js");

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({

        docs: {
            type: new GraphQLList(DocumentType),
            description: 'List of all documents',
            resolve: async function() {
                return await documents.getAll();
            }
        },
    })
});

module.exports = RootQueryType;