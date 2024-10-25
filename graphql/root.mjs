import {GraphQLObjectType, GraphQLString } from 'graphql';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

// Define the Root Query Type
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

// Export the schema
export default RootQueryType;