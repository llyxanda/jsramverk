import 'dotenv/config';
import express from 'express';
import jwt from 'jsonwebtoken';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';
import { graphqlHTTP } from 'express-graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import { buildSchema } from 'graphql';
import pkg from 'express-jwt';
import posts from './routes/posts.mjs';
import docs from './datamodels/docs.mjs';
import auth from './datamodels/auth.mjs';
import schemaAuth from './graphql/authtypes.mjs';
import schemaDocs from './graphql/docstypes.mjs';
import http from "http";
import { Server } from "socket.io";


const JWT_SECRET = process.env.jwtSecret;
const { expressjwt } = pkg;
const app = express();
const port = process.env.PORT || 8080;
const httpServer = http.createServer(app);

const ios = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:3001", "http://localhost:3000", "https://www.student.bth.se/~sahb23/editor/"], // Add more origins here
    methods: ["GET", "POST"]
  }
});

let typingTimeouts = {};

ios.on('connection', (socket) => {
  console.log('a user connected:', socket);

  socket.on('joinDocument', ({ documentId, email }) => {
    socket.join(documentId);
    console.log(`User ${socket.id} (Email: ${email}) joined document ${documentId}`);
  });

  socket.on('typingContent', ({ documentId, content, email }) => {
    console.log(`User ${email} is typing in document ${documentId}: ${content ? content : ''}`);
    socket.to(documentId).emit('receiveTypingContent', content);

    if (typingTimeouts[documentId]) clearTimeout(typingTimeouts[documentId]);

    typingTimeouts[documentId] = setTimeout(async () => {
      try {
        const documentData = { id: documentId, content: content };
        const response = await docs.updateOne('documents', documentData);
        console.log(`Document ${documentId} saved with content: ${content} response:`, response);
      } catch (error) {
        console.error(`Error saving document ${documentId}:`, error);
      }
    }, 3000);
  });

  socket.on('typingTitle', ({ documentId, title, email }) => {
    console.log(`User ${email} is typing in document ${documentId}: ${title ? title : ''}`);
    socket.to(documentId).emit('receiveTypingTitle', title);
        
    if (typingTimeouts[documentId]) clearTimeout(typingTimeouts[documentId]);

    typingTimeouts[documentId] = setTimeout(async () => {
      try {
        const documentData = { id: documentId, title: title };
        const response = await docs.updateOne('documents', documentData);
        console.log(`Document ${documentId} saved with title: ${title} response:`, response);
      } catch (error) {
        console.error(`Error saving document ${documentId}:`, error);
      }
    }, 3000);
  });

  socket.on('disconnect', () => {
    console.log('user disconnected:', socket.id);
  });
});

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

function loggingMiddleware(req, res, next) {
  console.log("Client IP:", req.ip);
  next();
}

// JWT authentication middleware
const authMiddleware = expressjwt({
  secret: JWT_SECRET,
  algorithms: ['HS256'],
  credentialsRequired: true, // Ensure credentials are required
  getToken: (req) => {
    const token = req.headers.authorization?.split(' ')[1];
    console.log('Extracted Token:', token);
    return token;
  }
}).unless({
    path: [
      { url: '/graphql/auth', methods: ['POST'] }
    ]
  });

const attachUserMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (token) {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.log('JWT verification error:', err);
      } else {
        req.user = decoded;
        console.log('Decoded User:', req.user, req.ip);
      }
    });
  }
  next();
};

const root = {
  ip: (args, context) => context.ip,
  userData: (args, context) => context.user ? `Authenticated user email: ${context.user.email}` : "No authenticated user"
};


app.post('/user/register', async (req, res) => {
  try {
      await auth.register(res, req.body);
  } catch (error) {
      return res.status(500).json({
          errors: {
              status: 500,
              source: "/register",
              title: "Internal server error",
              detail: error.message
          }
      });
  }
});


app.post('/user/login', async (req, res) => {
  try {
      await auth.login(res, req.body);
  } catch (error) {
      return res.status(500).json({
          errors: {
              status: 500,
              source: "/login",
              title: "Internal server error",
              detail: error.message
          }
      });
  }
});


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
