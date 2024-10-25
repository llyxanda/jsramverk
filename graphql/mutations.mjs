// mutations.mjs
import { GraphQLObjectType, GraphQLString } from 'graphql';
import auth from '../datamodels/auth2.mjs';
import { RegisterResponseType, LoginResponseType } from './types.mjs';

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
                return response.data || response.errors;
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
                    message: "Login failed", // Provide a generic message for failed login
                    user: null,
                    token: null,
                };
            },
        },
    },
});

export default Mutation;
