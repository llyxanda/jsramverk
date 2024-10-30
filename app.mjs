import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema } from 'graphql';
import posts from './routes/posts.mjs';
//import docs from './datamodels/docs.mjs';
//import auth from './datamodels/auth.mjs';
import schemaAuth from './graphql/authtypes.mjs';
import schemaDocs from './graphql/docstypes.mjs';
import http from "http";
import { Server } from "socket.io";
import {loggingMiddleware, authMiddleware, attachUserMiddleware} from "./middlewares/authMiddleware.mjs"
import { initializeSockets } from './sockets/socketConfig.mjs';


const app = express();
const port = process.env.PORT || 8080;
const httpServer = http.createServer(app);

initializeSockets(httpServer); 
app.use(express.static(path.join(process.cwd(), "public")));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));



app.get("/", async (req, res) => {
  //await docs.deleteAll('documents');
  res.render('index', {
    title: 'API Documentation',
    routes: [
      { method: 'GET', path: '/', description: 'API Documentation' },
      { method: 'GET', path: '/posts', description: 'Get all documents' },
      { method: 'GET', path: '/posts/new', description: 'Form to create a new document' },
      { method: 'POST', path: '/posts/new', description: 'POST route to create a new document' },
      { method: 'GET', path: '/posts/:id', description: 'Get a document by ID' },
      { method: 'GET', path: '/posts/update/:id', description: 'Form to update a document' },
      { method: 'POST', path: '/posts/:id', description: 'POST route to update a document by ID' },
      { method: 'POST', path: '/posts/mail/send-invite', description: 'POST route send an invitation email' },
      { method: 'POST', path: '/posts/users/register', description: 'POST route to register a new user' },
      { method: 'POST', path: '/posts/users/login', description: 'POST route to log in' },
      { method: 'POST', path: '/posts/graphql/docs', description: 'Update documents' },
      { method: 'GET', path: '/posts/graphql/docs', description: 'Get document data' },
      { method: 'POST', path: '/posts/graphql/auth', description: 'Register and login users' },
    ]
  });
});


const schemaAuthmiddleware = buildSchema(`
  type Query {
    ip: String
    userData: String
  }
`);

const root = {
  ip: (args, context) => context.ip,
  userData: (args, context) => context.user ? `Authenticated user email: ${context.user.email}` : "No authenticated user"
};



app.use("/posts", posts);
app.use(loggingMiddleware);
app.use(authMiddleware);
app.use(attachUserMiddleware);


app.all("/graphql", createHandler({
  schema: schemaAuthmiddleware,
  rootValue: root,
  context: req => ({
    ip: req.raw.ip,
    user: req.raw.user
  }),
}));

app.disable('x-powered-by');
app.set("view engine", "ejs");

app.use("/posts", posts);
app.use('/graphql/auth', graphqlHTTP({
  schema: schemaAuth,
  graphiql: false,
}));
app.use('/graphql/docs', graphqlHTTP({
  schema: schemaDocs,
  graphiql: false,
}));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

const server = httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

export default server;
