// mutations.mjs
import { GraphQLObjectType, GraphQLString, GraphQLSchema } from 'graphql';
import auth from '../datamodels/auth2.mjs';
import { RegisterResponseType, LoginResponseType, RootQueryType } from './types.mjs';

const Mutation = new GraphQLObjectType({
    name: 'Mutation',
    fields: {
        register: {
            type: RegisterResponseType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            resolve: async (_, { email, password }) => {
                const response = await auth.register({ email, password });
                if (response.errors) {
                    return {
                        message: response.errors.detail,
                        user: null,
                    };
                }
                
                return response.data;
            },
        },
        login: {
            type: LoginResponseType,
            args: {
                email: { type: GraphQLString },
                password: { type: GraphQLString },
            },
            resolve: async (_, { email, password }) => {
                const response = await auth.login({ email, password });
                if (response.data) {
                    return {
                        message: response.data.message,
                        user: { email: response.data.user.email }, 
                        token: response.data.token,
                    };
                }
                return {
                    message: response.errors.detail,
                    user: null,
                    token: null,
                };
            },
        },
    },
});

export default new GraphQLSchema({
    query: RootQueryType,
    mutation: Mutation,
});


