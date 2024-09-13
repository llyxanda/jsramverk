import 'dotenv/config';
import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import morgan from 'morgan';

import documents from "./docs.mjs";

const app = express();
const port = process.env.PORT;

app.disable('x-powered-by');
app.set("view engine", "ejs");
app.use(express.static(path.join(process.cwd(), "public")));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined'));
}

app.get('/', async (req, res) => {
    try {
        const docs = await documents.getAll();
        return res.render("index", { docs });
    } catch (e) {
        console.error('Error fetching documents:', e);
        res.status(500).send('Error fetching documents');
    }
});

app.get('/new', (req, res) => {
    return res.render('new');
});

app.post('/new', async (req, res) => {
    const { title, content } = req.body;

    try {
        const result = await documents.addOne({ title, content });
        return res.redirect('/');
    } catch (e) {
        console.error('Error creating document:', e);
        res.status(500).send('Error creating document');
    }
});

app.get('/:id', async (req, res) => {
    try {
        const doc = await documents.getOne(req.params.id);
        if (!doc) {
            return res.status(404).send("Dokumentet hittades inte.");
        }
        return res.render("doc", { doc });
    } catch (error) {
        console.error('Error fetching document:', error);
        return res.status(500).send('Något gick fel.');
    }
});

app.post('/:id', async (req, res) => {
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        await documents.updateOne({ id: parseInt(id), title, content });
        return res.redirect('/');
    } catch (e) {
        console.error('Error updating document:', e);
        res.status(500).send('Error updating document');
    }
});

app.listen(port, () => {
    console.log(`App listening on port ${port}`);
});
