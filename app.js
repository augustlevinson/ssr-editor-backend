require('dotenv/config');

const port = process.env.PORT || 1337;

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const morgan = require('morgan');
const cors = require('cors');

const documents = require('./docs.js');
const auth = require('./auth.js');

const app = express();

app.use(cors());

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

app.get('/add', async (req, res) => {
    return res.json({new_id: await documents.addOne("Namnlöst dokument", "")})
});

app.put("/edit", async (req, res) => {
    return res.json({doc: await documents.editOne(req.body)})
});

app.get('/docs/:id', async (req, res) => {
    return res.json({doc: await documents.getOne(req.params.id)});
});

app.get('/search/:string', async (req, res) => {
    console.log(req.params.string);
});

app.get('/', async (req, res) => {
    return res.json({docs: await documents.getAll()});
});

app.delete("/delete", async (req, res) => {
    return res.json({deleted: await documents.deleteOne(req.body.id)});
});

app.get("/reset", async (req, res) => {
    await documents.resetDb();
    return res.redirect(`/`);
});

app.get('/users/all', async (req, res) => {
    return res.json({users: await auth.getAll()});
});

app.get('/users/clear', async (req, res) => {
    return res.json({users: await auth.clearDb()});
});

app.post('/users/register', async (req, res) => {
    return res.json({success: await auth.register(req.body)});
});

app.post('/users/login', async (req, res) => {
    return res.json(await auth.login(req.body));
});

app.post('/users/update', async (req, res) => {
    return res.json(await auth.editOne(req.body));
});

const server = app.listen(port, () => {
    console.log(`SSR Editor running port ${port}`)
});
