import 'dotenv/config'

const port = process.env.PORT;

import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';
import cors from 'cors';

import documents from "./docs.mjs";

const app = express();

app.disable('x-powered-by');

app.set("view engine", "ejs");

app.use(express.static(path.join(process.cwd(), "public")));

// don't show the log when it is test
if (process.env.NODE_ENV !== 'test') {
    // use morgan to log at command line
    app.use(morgan('combined')); // 'combined' outputs the Apache style LOGs
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
    const result = await documents.addOne(req.body);

    return res.redirect(`/${result.lastID}`);
});

app.get('/:id', async (req, res) => {
    const response = await documents.getOne(req.params.id);
    console.log('response', response)
    return res.render(
        "doc",
        { doc: response}
    );
});


app.post('/:id', async (req, res) => {
    const { id } = req.params; // Extract the ID from the route parameters
    const { title, content } = req.body; // Extract title and content from the form data

    const body = {
        id:parseInt( id),
        title:title,
        content:content
    };
    console.log('body', body)

    try {
        // Update the document in the database
        const response = await documents.updateOne(body);
        console.log('Updated response', response)
        res.redirect(`/${body.id}`);
    } catch (e) {
        console.error('Error updating document:', e);
        res.status(500).send('Error updating document');
    }
});


app.get('/', async (req, res) => {
    return res.render("index", { docs: await documents.getAll() });
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
