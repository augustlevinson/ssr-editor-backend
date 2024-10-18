const {
    GraphQLObjectType,
    GraphQLString,
    GraphQLList,
} = require('graphql');

const DocumentType = require("./documents.js");
const documents = require("../docs.js");
const auth = require('../auth.js');

const RootQueryType = new GraphQLObjectType({
    name: 'Query',
    description: 'Root Query',
    fields: () => ({
        docs: {
            type: new GraphQLList(DocumentType),
            description: 'List of all documents for given user',
            args: {
                email: { type: GraphQLString },
                token: { type: GraphQLString }
            },
            resolve: async (parent, args) => {
                const validate = await auth.validateToken(args);
                if (validate) {
                    const getUser = await auth.getOne(args.email)
                    return await documents.getAllByUserId(getUser._id);
                } else {
                    return "unauthenticated";
                }
            }
        },
    })
});

module.exports = RootQueryType;