// schema.js
import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLID } from 'graphql';
import docs from '../datamodels/docs.mjs';

const DocumentType = new GraphQLObjectType({
    name: 'Document',
    fields: {
        _id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        created_at: { type: GraphQLString },
        allowed: { type: new GraphQLList(GraphQLString) },
    },
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        getAllDocuments: {
            type: new GraphQLList(DocumentType),
            async resolve() {
                return await docs.getAll('documents');
            },
        },
        getDocument: {
            type: DocumentType,
            args: { id: { type: GraphQLID } },
            async resolve(_, args) {
                return await docs.getOne('documents', args.id);
            },
        },
        getAllDocumentsForUser: {
            type: new GraphQLList(DocumentType),
            args: { email: { type: GraphQLString } },
            async resolve(_, args) {
                return await docs.getAllForUser('documents', args.email);
            },
        },
    },
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        addDocument: {
            type: DocumentType,
            args: {
                title: { type: GraphQLString },
                content: { type: GraphQLString },
                allowed: { type: new GraphQLList(GraphQLString) },
            },
            
            async resolve(_, args) {
                const document = {
                    title: args.title,
                    content: args.content,
                    allowed: args.allowed || [],
                };
                console.log('Document to add:', document);
                return await docs.addOne('documents', document);
            },
        },
        updateDocument: {
            type: DocumentType,
            args: {
                id: { type: GraphQLID },
                title: { type: GraphQLString },
                content: { type: GraphQLString },
                allowed: { type: new GraphQLList(GraphQLString) },
            },
            async resolve(_, args) {
                const document = {
                    id: args.id,
                    title: args.title,
                    content: args.content,
                    allowed: args.allowed,
                };
                return await docs.updateOne('documents', document);
            },
        },
        deleteAllDocuments: {
            type: GraphQLString,
            async resolve() {
                await docs.deleteAll('documents');
                return "All documents deleted successfully.";
            },
        },
    },
});

export default new GraphQLSchema({
    query: RootQuery,
    mutation: Mutation,
});
