import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import posts from './routes/posts.mjs'
import cors from 'cors';
//import './db/database.mjs'
import docs from './datamodels/docs.mjs'


const app = express();
const port = process.env.PORT || 8080;

app.disable('x-powered-by');
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/posts", posts );


app.get("/", (req, res) => {
    res.render('index', { title: 'API Documentation', routes: [
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
    ] });
});

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}


const server = app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});

export default server;