import express from "express";
import sendInvitationEmail from '../datamodels/sendmail.mjs';
import documents from "../datamodels/docs.mjs";
import auth from '../datamodels/auth.mjs';

const router = express.Router();

router.use(express.json());

router.get('/', async (req, res) => {
    try {
        const docs = await documents.getAll('documents');
        //return res.render("index", { docs });
        console.log(docs)
        return res.json({data: docs})
    } catch (e) {
        console.error('Error fetching documents:', e);
        res.status(500).send('Error fetching documents');
    }
});

router.get('/new', (req, res) => {
    return res.render('new');
});

router.post('/new', async (req, res) => {
    const { title, content } = req.body;

    try {
        const newDocument = await documents.addOne('documents', { title, content });
        return res.json({ success: true, data: newDocument });
    } catch (e) {
        console.error('Error creating document:', e);
        res.status(500).send('Error creating document');
    }
});



router.get('/:id', async (req, res) => {
    try {
        const doc = await documents.getOne('documents', req.params.id);
        if (!doc) {
            console.log(req.params.id)
            return res.status(404).send("Dokumentet hittades inte.");
        }
        return res.json(doc);
    } catch (e) {
        console.error('Error fetching document:', e);
        return res.status(500).send('Något gick fel.');
    }
});


router.get('/update/:id', async (req, res) => {
    try {
        const doc = await documents.getOne('documents', req.params.id);
        if (!doc) {
            return res.status(404).send("Dokumentet hittades inte.");
        }
        return res.render("doc", { doc });
    } catch (e) {
        console.error('Error fetching document:', e);
        return res.status(500).send('Något gick fel.');
    }
});

router.post('/:id', async (req, res) => {
    console.log('id:', req.params)
    const { id } = req.params;
    const { title, content } = req.body;

    try {
        const doc = await documents.updateOne('documents', { id: id, title, content });
        return res.json(doc);
    } catch (e) {
        console.error('Error updating document:', e);
        res.status(500).json({ error: e.message }); // Return error details
    }
});



router.post('/mail/send-invite', async (req, res) => {
    const { email, documentUrl } = req.body;

    if (!email || !documentUrl) {
        return res.status(400).json({ error: 'Email and Document URL are required' });
    }

    try {
        const emailResponse = await sendInvitationEmail(email, documentUrl); // Await the email sending
        return res.status(200).json(emailResponse); // Return the response from the email sending function
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: error.message }); // Return error message
    }
});

router.post('/user/register', async (req, res) => {
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


router.post('/user/login', async (req, res) => {
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

router.get('/users/all', async (req, res) => {
    await auth.getAllUsers(res);
});

export default router;