// types.mjs
import { GraphQLObjectType, GraphQLString } from 'graphql';

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        message: {
            type: GraphQLString,
            resolve() {
                return 'Hello, GraphQL!';
            }
        }
    }
});

const UserType = new GraphQLObjectType({
    name: 'User',
    fields: {
        email: { type: GraphQLString },
    },
});

const RegisterResponseType = new GraphQLObjectType({
    name: 'RegisterResponse',
    fields: {
        message: { type: GraphQLString },
        user: { type: GraphQLString },
    },
});



const LoginResponseType = new GraphQLObjectType({
    name: 'LoginResponse',
    fields: {
        message: { type: GraphQLString },
        user: { type: UserType }, // Use the UserType here
        token: { type: GraphQLString }, // If you are returning a token, include it
    },
});



export { RegisterResponseType, LoginResponseType, UserType, RootQueryType};
