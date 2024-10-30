
import { GraphQLObjectType, GraphQLString, GraphQLSchema, GraphQLList } from 'graphql';
import auth from '../datamodels/auth2.mjs';


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
        user: { type: UserType },
    },
});



const LoginResponseType = new GraphQLObjectType({
    name: 'LoginResponse',
    fields: {
        message: { type: GraphQLString },
        user: { type: UserType },
        token: { type: GraphQLString },
    },
});

const RootQueryType = new GraphQLObjectType({
    name: 'RootQuery',
    fields: {
        usersData: {
            type: new GraphQLList(UserType),
            description: 'Fetch user data - email and token',
            async resolve() {
                const usersData = await auth.getAllUsers();
                console.log(usersData)
                return usersData;
            },
        },
        userData: {
            type: UserType,
            description: 'Fetch user data for an user email',
            args: { email: { type: GraphQLString } },
            async resolve(_, args) {
                const userData = await auth.getdataByEmail(args.email);
                return userData;
            },
        },
    },
});


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
                if (response.data.user.user) {
                    return {
                        message: response.data.message,
                        user: { email: response.data.user.user }, 
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
