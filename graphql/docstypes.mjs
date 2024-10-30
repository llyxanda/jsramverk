
import { GraphQLObjectType, GraphQLSchema, GraphQLString, GraphQLList, GraphQLID, GraphQLBoolean } from 'graphql';
import docs from '../datamodels/docs.mjs';

const DocumentType = new GraphQLObjectType({
    name: 'Document',
    fields: {
        _id: { type: GraphQLID },
        title: { type: GraphQLString },
        content: { type: GraphQLString },
        created_at: { type: GraphQLString },
        code: {type: GraphQLBoolean },
        allowed: { type: new GraphQLList(GraphQLString) },
    },
});

const RootQuery = new GraphQLObjectType({
    name: 'RootQueryType',
    fields: {
        documents: {
            type: new GraphQLList(DocumentType),
            description: 'List of all documents',
            async resolve() {
                console.log( await docs.getAll('documents'))
                return await docs.getAll('documents');
            },
        },
        document: {
            type: DocumentType,
            args: { id: { type: GraphQLID } },
            description: 'Get a document by id',
            async resolve(_, args) {
                return await docs.getOne('documents', args.id);
            },
        },
        userdocuments: {
            type: new GraphQLList(DocumentType),
            args: { email: { type: GraphQLString } },
            description: 'Get documents for one user',
            async resolve(_, args) {
                return await docs.getAllForUser('documents', args.email);
            },
        },
    },
});

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        adddocument: {
            type: DocumentType,
            args: {
                title: { type: GraphQLString },
                content: { type: GraphQLString },
                code : {type: GraphQLBoolean },
                allowed: { type: new GraphQLList(GraphQLString) },
            },
            description: 'Add one document',
            
            async resolve(_, args) {
                const document = {
                    title: args.title,
                    content: args.content,
                    code : args.code || false,
                    allowed: args.allowed || [],
                };
                console.log('Document to add:', document);
                return await docs.addOne('documents', document);
            },
        },
        updatedocument: {
            type: DocumentType,
            args: {
                id: { type: GraphQLID },
                title: { type: GraphQLString },
                content: { type: GraphQLString },
                code : {type: GraphQLBoolean },
                allowed: { type: new GraphQLList(GraphQLString) },
            },
            description: 'Update a document',
            async resolve(_, args) {
                const document = {
                    id: args.id,
                    title: args.title,
                    content: args.content,
                    code : args.code,
                    allowed: args.allowed,
                };
                return await docs.updateOne('documents', document);
            },
        },
        deletealldocuments: {
            type: GraphQLString,
            description: 'Delete all documents',
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
