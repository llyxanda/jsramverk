import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import posts from './routes/posts.mjs'
import cors from 'cors';
//import './db/database.mjs'
import docs from './docs.mjs'


const app = express();
const port = process.env.PORT;

app.disable('x-powered-by');
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/posts", posts );

app.get("/", (req, res) => res.send('Hej!') )

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}


app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
